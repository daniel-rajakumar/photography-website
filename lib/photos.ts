"use server";

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { exiftool } from "exiftool-vendored";

export interface LocalPhoto {
  filename: string;
  title: string;
  category: "landscape" | "portrait" | "abstract" | "architecture" | "street" | string;
  date: string;
  phone: string;
  location: string;
  alt: string;
  featured: boolean;
  order: number;
  uploadIndex?: number;
  uploadTime?: string;
  hasOriginal?: boolean;
}

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");
const ORIGINALS_DIR = path.join(PHOTOS_DIR, "originals");
const DATA_FILE = path.join(process.cwd(), "data", "photos.json");
const VALID_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9 -]/g, "").replace(/\s+/g, " ").trim();
}

// Helper to get true file date (macOS mdls fallback to fs.stat)
function getFileDate(filePath: string): string {
  try {
    const mdlsOutput = execSync(`mdls -name kMDItemContentCreationDate -raw "${filePath}"`, { encoding: "utf8", stdio: "pipe" }).trim();
    if (mdlsOutput !== "(null)" && mdlsOutput !== "") {
      const parsedDate = new Date(mdlsOutput);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }
  } catch (err) {
    // Ignore errors (e.g. if not on macOS)
  }
  
  const stats = fs.statSync(filePath);
  return (stats.birthtime.getTime() === 0 ? stats.mtime : stats.birthtime).toISOString();
}

export async function getLocalPhotos(): Promise<LocalPhoto[]> {
  // Ensure photos dir exists
  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }
  
  // Ensure data file exists
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }

  // Read saved metadata
  const rawData = fs.readFileSync(DATA_FILE, "utf-8");
  let savedMetadata: LocalPhoto[] = [];
  try {
    savedMetadata = JSON.parse(rawData);
  } catch (e) {
    savedMetadata = [];
  }

  // Read actual files in the folder (excluding subdirectories)
  const files = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name)
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return VALID_EXTENSIONS.includes(ext);
    });

  const allPhotos: LocalPhoto[] = await Promise.all(files.map(async (file) => {
    const existingMeta = savedMetadata.find((meta) => meta.filename === file);
    if (existingMeta) {
      existingMeta.hasOriginal = fs.existsSync(path.join(ORIGINALS_DIR, file));
      return existingMeta;
    }

    // Generate defaults for new files
    const filePath = path.join(PHOTOS_DIR, file);
    const baseName = path.basename(file, path.extname(file));
    let titleStr = baseName;
    // Check if it already matches our format: [order] - [date] - [Title]
    const formatMatch = baseName.match(/^\d+\s*-\s*\d{4}-\d{2}-\d{2}\s*-\s*(.+)$/);
    if (formatMatch) {
      titleStr = formatMatch[1];
    }
    const title = titleStr.replace(/[-_]/g, " ");
    const formattedTitle = title
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    let phoneModel = "iPhone 15 Pro"; // Fallback
    try {
      const metadata = await exiftool.read(filePath);
      if (metadata.Model) {
        phoneModel = String(metadata.Model);
      }
    } catch (e) {
      console.error(`Failed to read EXIF for ${file}:`, e);
    }

    const hasOriginal = fs.existsSync(path.join(ORIGINALS_DIR, file));

    return {
      filename: file,
      title: formattedTitle,
      category: "landscape",
      date: getFileDate(filePath),
      phone: phoneModel,
      location: "",
      alt: formattedTitle,
      featured: false,
      order: 999,
      uploadTime: new Date().toISOString(),
      hasOriginal,
    };
  }));

  // Assign dynamic upload index based on true upload order
  const sortedByUpload = [...allPhotos].sort((a, b) => {
    const timeA = a.uploadTime ? new Date(a.uploadTime).getTime() : new Date(a.date).getTime();
    const timeB = b.uploadTime ? new Date(b.uploadTime).getTime() : new Date(b.date).getTime();
    return timeA - timeB;
  });
  
  sortedByUpload.forEach((photo, i) => {
    photo.uploadIndex = i + 1;
  });

  // Sort by uploadIndex descending
  allPhotos.sort((a, b) => (b.uploadIndex || 0) - (a.uploadIndex || 0));

  return allPhotos;
}

export async function savePhotoMetadata(updatedPhotos: LocalPhoto[]): Promise<LocalPhoto[]> {
  try {
    // Read previous data to detect changes
    let oldPhotos: LocalPhoto[] = [];
    if (fs.existsSync(DATA_FILE)) {
      oldPhotos = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }

    const finalPhotos: LocalPhoto[] = [];

    // Write metadata to files that have changed and rename them
    for (const newPhoto of updatedPhotos) {
      const oldPhoto = oldPhotos.find(p => p.filename === newPhoto.filename) || newPhoto;
      
      const locationChanged = oldPhoto.location !== newPhoto.location;
      const titleChanged = oldPhoto.title !== newPhoto.title;

      let currentFilename = oldPhoto.filename;

      // Construct new filename
      const ext = path.extname(currentFilename);
      const datePart = newPhoto.date ? newPhoto.date.split("T")[0] : "NoDate";
      const titlePart = sanitizeFilename(newPhoto.title || "Untitled");
      const uploadIdxPart = String(newPhoto.uploadIndex || 0).padStart(3, "0");
      let newFilename = `${uploadIdxPart} - ${datePart} - ${titlePart}${ext}`;

      // Rename physical file if different
      if (newFilename !== currentFilename) {
        const oldPath = path.join(PHOTOS_DIR, currentFilename);
        let newPath = path.join(PHOTOS_DIR, newFilename);
        
        if (fs.existsSync(oldPath)) {
          // Prevent overwriting if filename already exists
          let counter = 1;
          while (fs.existsSync(newPath) && newPath !== oldPath) {
             newFilename = `${uploadIdxPart} - ${datePart} - ${titlePart} (${counter})${ext}`;
             newPath = path.join(PHOTOS_DIR, newFilename);
             counter++;
          }
          
          if (newPath !== oldPath) {
            fs.renameSync(oldPath, newPath);
            
            // Rename original if it exists
            const oldOriginalPath = path.join(ORIGINALS_DIR, currentFilename);
            if (fs.existsSync(oldOriginalPath)) {
              const newOriginalPath = path.join(ORIGINALS_DIR, newFilename);
              fs.renameSync(oldOriginalPath, newOriginalPath);
            }

            currentFilename = newFilename;
          }
        }
      }

      // Update filename in JSON data
      newPhoto.filename = currentFilename;
      newPhoto.hasOriginal = fs.existsSync(path.join(ORIGINALS_DIR, currentFilename));
      
      // Persist uploadTime if missing in JSON but present in object
      if (!oldPhoto.uploadTime && newPhoto.uploadTime) {
        // Just ensuring it gets saved
      }

      if (locationChanged || titleChanged) {
        const filePath = path.join(PHOTOS_DIR, newPhoto.filename);
        if (fs.existsSync(filePath)) {
          const writeData: any = {};
          if (locationChanged && newPhoto.location) {
            writeData.Location = newPhoto.location;
          }
          if (titleChanged && newPhoto.title) {
            writeData.Title = newPhoto.title;
            writeData.Description = newPhoto.title;
          }

          if (Object.keys(writeData).length > 0) {
            await exiftool.write(filePath, writeData, ["-overwrite_original"]);
          }
        }
      }
      
      finalPhotos.push(newPhoto);
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(finalPhotos, null, 2), "utf-8");
    return finalPhotos;
  } catch (error) {
    console.error("Failed to save photo metadata:", error);
    throw new Error("Failed to save metadata");
  }
}
