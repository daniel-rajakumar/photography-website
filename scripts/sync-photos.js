import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { getCliClient } from "sanity/cli";

const client = getCliClient();
const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");

const VALID_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

function getFileDate(filePath) {
  try {
    const mdlsOutput = execSync(`mdls -name kMDItemContentCreationDate -raw "${filePath}"`, { encoding: 'utf8' }).trim();
    if (mdlsOutput !== "(null)" && mdlsOutput !== "") {
      const parsedDate = new Date(mdlsOutput);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }
  } catch (err) {
    // Ignore errors and fallback
  }
  
  const stats = fs.statSync(filePath);
  return (stats.birthtime.getTime() === 0 ? stats.mtime : stats.birthtime).toISOString();
}

async function syncPhotos() {
  console.log("Starting dynamic photo sync...");

  // Ensure directory exists
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.log(`Creating directory: ${PHOTOS_DIR}`);
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }

  // Read local files
  const files = fs.readdirSync(PHOTOS_DIR).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return VALID_EXTENSIONS.includes(ext);
  });
  console.log(`Found ${files.length} valid images in ${PHOTOS_DIR}`);

  // Fetch existing photos from Sanity
  console.log("Fetching existing photos from Sanity...");
  const existingDocs = await client.fetch(
    `*[_type == "photo"]{_id, title, filename, date}`
  );
  
  const existingFilenames = existingDocs
    .map((doc) => doc.filename)
    .filter(Boolean);

  // Identify additions and deletions
  const toAdd = files.filter((file) => !existingFilenames.includes(file));
  const toDelete = existingDocs.filter(
    (doc) => !doc.filename || !files.includes(doc.filename)
  );
  const toUpdate = existingDocs.filter(
    (doc) => doc.filename && files.includes(doc.filename)
  );

  console.log(`\nFound ${toAdd.length} new files to upload.`);
  console.log(`Found ${toUpdate.length} documents to update.`);
  console.log(`Found ${toDelete.length} documents to remove.`);

  // Handle Deletions
  if (toDelete.length > 0) {
    console.log("\n--- Processing Deletions ---");
    for (const doc of toDelete) {
      try {
        console.log(`Deleting document: ${doc.title} (${doc.filename})`);
        await client.delete(doc._id);
      } catch (err) {
        console.error(`Failed to delete ${doc._id}:`, err);
      }
    }
  }

  // Handle Additions
  if (toAdd.length > 0) {
    console.log("\n--- Processing Additions ---");
    for (const file of toAdd) {
      try {
        const filePath = path.join(PHOTOS_DIR, file);
        console.log(`Uploading ${file}...`);
        
        const fileStream = fs.createReadStream(filePath);
        const asset = await client.assets.upload("image", fileStream, {
          filename: file,
        });

        const title = path.basename(file, path.extname(file)).replace(/[-_]/g, " ");
        // Capitalize title
        const formattedTitle = title
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        console.log(`Creating document for ${file}...`);
        const fileDate = getFileDate(filePath);

        const doc = {
          _type: "photo",
          title: formattedTitle,
          filename: file,
          date: fileDate,
          category: "landscape", // Default category
          phone: "iPhone 15 Pro", // Default phone
          alt: formattedTitle,
          featured: false,
          image: {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: asset._id,
            },
          },
        };

        const result = await client.create(doc);
        console.log(`Successfully created document for ${file} (ID: ${result._id})`);
      } catch (err) {
        console.error(`Failed to sync ${file}:`, err);
      }
    }
  }

  // Handle Updates
  if (toUpdate.length > 0) {
    console.log("\n--- Processing Updates ---");
    for (const doc of toUpdate) {
      try {
        const filePath = path.join(PHOTOS_DIR, doc.filename);
        const fileDate = getFileDate(filePath);

        console.log(`Updating document for ${doc.filename}...`);
        await client.patch(doc._id).set({ date: fileDate }).commit();
        console.log(`Successfully updated document for ${doc.filename}`);
      } catch (err) {
        console.error(`Failed to update ${doc.filename}:`, err);
      }
    }
  }

  console.log("\nSync complete!");
}

syncPhotos().catch(console.error);
