"use server";

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { exiftool } from "exiftool-vendored";
import { revalidatePath } from "next/cache";

export interface LocalPhoto {
  filename: string;
  imagePath?: string;
  originalPath?: string;
  title: string;
  category: "landscape" | "portrait";
  date: string;
  phone: string;
  location: string;
  alt: string;
  featured: boolean;
  order: number;
  uploadIndex?: number;
  uploadTime?: string;
  hasOriginal?: boolean;
  hidden?: boolean;
}

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");
const ORIGINALS_DIR = path.join(PHOTOS_DIR, "originals");
const DATA_FILE = path.join(process.cwd(), "data", "photos.json");
const VALID_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const EDITED_FILE_BASENAME = "edited";
const RAW_FILE_BASENAME = "raw";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9 -]/g, "").replace(/\s+/g, " ").trim();
}

function isPhotoFile(file: string): boolean {
  return VALID_EXTENSIONS.includes(path.extname(file).toLowerCase());
}

function getPhotoVariantPath(folderPath: string, variant: string): string | null {
  if (!fs.existsSync(folderPath)) return null;

  const file = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    .filter(isPhotoFile)
    .filter((fileName) => path.basename(fileName, path.extname(fileName)).toLowerCase() === variant)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    [0];

  return file ? path.join(folderPath, file) : null;
}

function toPhotoUrl(filePath: string): string {
  return `/photos/${path.relative(PHOTOS_DIR, filePath).split(path.sep).join("/")}`;
}

function fromPhotoUrl(photoUrl?: string): string | null {
  if (!photoUrl?.startsWith("/photos/")) return null;

  return path.join(PHOTOS_DIR, photoUrl.replace(/^\/photos\//, ""));
}

function getPhotoFolderName(photo: LocalPhoto): string {
  const datePart = photo.date ? photo.date.split("T")[0] : "NoDate";
  const titlePart = sanitizeFilename(photo.title || "Untitled");
  const uploadIdxPart = String(photo.uploadIndex || 0).padStart(3, "0");
  return `${uploadIdxPart} - ${datePart} - ${titlePart}`;
}

function titleFromStructuredName(name: string): string {
  let titleStr = name;
  const formatMatch = name.match(/^\d+\s*-\s*\d{4}-\d{2}-\d{2}\s*-\s*(.+)$/);
  if (formatMatch) {
    titleStr = formatMatch[1];
  }

  return titleStr
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function findSavedMetadata(savedMetadata: LocalPhoto[], identity: string, imagePath?: string): LocalPhoto | undefined {
  return savedMetadata.find((meta) =>
    meta.filename === identity ||
    meta.imagePath === imagePath ||
    meta.filename === path.basename(imagePath ?? "")
  );
}

function getMetadataNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getOrientationFromDimensions(width: unknown, height: unknown): LocalPhoto["category"] | null {
  const imageWidth = getMetadataNumber(width);
  const imageHeight = getMetadataNumber(height);

  if (!imageWidth || !imageHeight) return null;

  return imageWidth >= imageHeight ? "landscape" : "portrait";
}

async function getImageMetadata(filePath: string): Promise<{
  phone: string;
  orientation: LocalPhoto["category"];
}> {
  const fallback = {
    phone: "iPhone 15 Pro",
    orientation: "landscape" as const,
  };

  try {
    const metadata = await exiftool.read(filePath);

    return {
      phone: metadata.Model ? String(metadata.Model) : fallback.phone,
      orientation: getOrientationFromDimensions(metadata.ImageWidth, metadata.ImageHeight) ?? fallback.orientation,
    };
  } catch (error) {
    console.error(`Failed to read EXIF for ${filePath}:`, error);
    return fallback;
  }
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
  } catch {
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
  } catch {
    savedMetadata = [];
  }

  const folderPhotos = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter((dirent) =>
      dirent.isDirectory() &&
      dirent.name !== "originals" &&
      !dirent.name.startsWith(".")
    )
    .map((dirent) => {
      const folderPath = path.join(PHOTOS_DIR, dirent.name);
      const editedPath = getPhotoVariantPath(folderPath, EDITED_FILE_BASENAME);
      if (!editedPath) return null;

      const rawPath = getPhotoVariantPath(folderPath, RAW_FILE_BASENAME);

      return {
        identity: dirent.name,
        filePath: editedPath,
        imagePath: toPhotoUrl(editedPath),
        originalPath: rawPath ? toPhotoUrl(rawPath) : undefined,
      };
    })
    .filter((photo): photo is NonNullable<typeof photo> => photo !== null);

  const legacyPhotos = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    .filter(isPhotoFile)
    .map((file) => {
      const filePath = path.join(PHOTOS_DIR, file);
      const originalPath = path.join(ORIGINALS_DIR, file);

      return {
        identity: file,
        filePath,
        imagePath: toPhotoUrl(filePath),
        originalPath: fs.existsSync(originalPath) ? toPhotoUrl(originalPath) : undefined,
      };
    });

  const files = [...folderPhotos, ...legacyPhotos];

  const allPhotos: LocalPhoto[] = await Promise.all(files.map(async (photoFile) => {
    const existingMeta = findSavedMetadata(savedMetadata, photoFile.identity, photoFile.imagePath);
    const imageMetadata = await getImageMetadata(photoFile.filePath);

    if (existingMeta) {
      return {
        ...existingMeta,
        filename: photoFile.identity,
        imagePath: photoFile.imagePath,
        originalPath: photoFile.originalPath,
        category: imageMetadata.orientation,
        phone: imageMetadata.phone,
        hasOriginal: !!photoFile.originalPath,
      };
    }

    // Generate defaults for new files
    const formattedTitle = titleFromStructuredName(path.basename(photoFile.identity, path.extname(photoFile.identity)));

    return {
      filename: photoFile.identity,
      imagePath: photoFile.imagePath,
      originalPath: photoFile.originalPath,
      title: formattedTitle,
      category: imageMetadata.orientation,
      date: getFileDate(photoFile.filePath),
      phone: imageMetadata.phone,
      location: "",
      alt: formattedTitle,
      featured: false,
      hidden: false,
      order: 999,
      uploadTime: new Date().toISOString(),
      hasOriginal: !!photoFile.originalPath,
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
      const oldPhoto = oldPhotos.find((p) =>
        p.filename === newPhoto.filename ||
        p.imagePath === newPhoto.imagePath
      ) || newPhoto;
      
      const locationChanged = oldPhoto.location !== newPhoto.location;
      const titleChanged = oldPhoto.title !== newPhoto.title;

      const currentFolderPath = path.join(PHOTOS_DIR, oldPhoto.filename);
      const isFolderPhoto = fs.existsSync(currentFolderPath) && fs.statSync(currentFolderPath).isDirectory();
      let editedFilePath = fromPhotoUrl(oldPhoto.imagePath) ?? path.join(PHOTOS_DIR, oldPhoto.filename);

      if (isFolderPhoto) {
        let newFolderName = getPhotoFolderName(newPhoto);
        let newFolderPath = path.join(PHOTOS_DIR, newFolderName);

        let counter = 1;
        while (fs.existsSync(newFolderPath) && newFolderPath !== currentFolderPath) {
          newFolderName = `${getPhotoFolderName(newPhoto)} (${counter})`;
          newFolderPath = path.join(PHOTOS_DIR, newFolderName);
          counter++;
        }

        if (newFolderPath !== currentFolderPath) {
          fs.renameSync(currentFolderPath, newFolderPath);
        }

        const editedPath = getPhotoVariantPath(newFolderPath, EDITED_FILE_BASENAME);
        const rawPath = getPhotoVariantPath(newFolderPath, RAW_FILE_BASENAME);

        newPhoto.filename = newFolderName;
        newPhoto.imagePath = editedPath ? toPhotoUrl(editedPath) : undefined;
        newPhoto.originalPath = rawPath ? toPhotoUrl(rawPath) : undefined;
        newPhoto.hasOriginal = !!rawPath;
        editedFilePath = editedPath ?? "";
      } else {
        let currentFilename = oldPhoto.filename;
        const ext = path.extname(currentFilename);
        const newBaseName = getPhotoFolderName(newPhoto);
        let newFilename = `${newBaseName}${ext}`;

        if (newFilename !== currentFilename) {
          const oldPath = path.join(PHOTOS_DIR, currentFilename);
          let newPath = path.join(PHOTOS_DIR, newFilename);
          
          if (fs.existsSync(oldPath)) {
            let counter = 1;
            while (fs.existsSync(newPath) && newPath !== oldPath) {
              newFilename = `${newBaseName} (${counter})${ext}`;
              newPath = path.join(PHOTOS_DIR, newFilename);
              counter++;
            }
            
            if (newPath !== oldPath) {
              fs.renameSync(oldPath, newPath);
              
              const oldOriginalPath = path.join(ORIGINALS_DIR, currentFilename);
              if (fs.existsSync(oldOriginalPath)) {
                const newOriginalPath = path.join(ORIGINALS_DIR, newFilename);
                fs.renameSync(oldOriginalPath, newOriginalPath);
              }

              currentFilename = newFilename;
            }
          }
        }

        const originalFilePath = path.join(ORIGINALS_DIR, currentFilename);
        newPhoto.filename = currentFilename;
        newPhoto.imagePath = toPhotoUrl(path.join(PHOTOS_DIR, currentFilename));
        newPhoto.originalPath = fs.existsSync(originalFilePath) ? toPhotoUrl(originalFilePath) : undefined;
        newPhoto.hasOriginal = fs.existsSync(originalFilePath);
        editedFilePath = path.join(PHOTOS_DIR, currentFilename);
      }
      
      // Persist uploadTime if missing in JSON but present in object
      if (!oldPhoto.uploadTime && newPhoto.uploadTime) {
        // Just ensuring it gets saved
      }

      if (locationChanged || titleChanged) {
        if (editedFilePath && fs.existsSync(editedFilePath)) {
          const writeData: Record<string, string> = {};
          if (locationChanged && newPhoto.location) {
            writeData.Location = newPhoto.location;
          }
          if (titleChanged && newPhoto.title) {
            writeData.Title = newPhoto.title;
            writeData.Description = newPhoto.title;
          }

          if (Object.keys(writeData).length > 0) {
            await exiftool.write(editedFilePath, writeData, ["-overwrite_original"]);
          }
        }
      }
      
      finalPhotos.push(newPhoto);
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(finalPhotos, null, 2), "utf-8");
    revalidatePath("/");
    return finalPhotos;
  } catch (error) {
    console.error("Failed to save photo metadata:", error);
    throw new Error("Failed to save metadata");
  }
}
