import fs from "fs";
import path from "path";
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const photos = [
  {
    title: "Mountain Requiem",
    category: "landscape",
    src: "photo-landscape-1.jpg",
    alt: "Aerial view of misty Pacific Northwest forest at golden sunrise",
    featured: true,
    location: "Cascade Range, WA",
  },
  {
    title: "Solitude",
    category: "portrait",
    src: "photo-portrait-1.jpg",
    alt: "Dramatic moody portrait of a young woman with golden rim light",
    featured: true,
    location: "Studio",
  },
  {
    title: "Midnight City",
    category: "street",
    src: "photo-street-1.jpg",
    alt: "Rainy city alley at night with neon reflections and lone figure",
    featured: true,
    location: "Tokyo, JP",
  },
  {
    title: "Iridescence",
    category: "abstract",
    src: "photo-abstract-1.jpg",
    alt: "Macro photograph of iridescent water droplets on dark petals",
    featured: true,
    location: "Studio",
  },
  {
    title: "Grand Archive",
    category: "architecture",
    src: "photo-architecture-1.jpg",
    alt: "Looking up at a magnificent ornate library spiral staircase",
    featured: false,
    location: "Vienna, AT",
  },
  {
    title: "The Haul",
    category: "portrait",
    src: "photo-portrait-2.jpg",
    alt: "Documentary portrait of a fisherman on boat at fiery sunset",
    featured: false,
    location: "Nova Scotia, CA",
  },
  {
    title: "Mirror World",
    category: "landscape",
    src: "photo-landscape-2.jpg",
    alt: "Lone dead tree silhouetted against purple dusk sky reflected in salt flats",
    featured: true,
    location: "Atacama, CL",
  },
  {
    title: "Ember Descent",
    category: "landscape",
    src: "hero-bg.jpg",
    alt: "Dramatic golden hour light breaking through storm clouds over mountains",
    featured: false,
    location: "Dolomites, IT",
  },
];

async function importPhotos() {
  console.log("Starting photo import to Sanity...");

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const imagePath = path.join(process.cwd(), "public", photo.src);

    if (!fs.existsSync(imagePath)) {
      console.error(`File not found: ${imagePath}`);
      continue;
    }

    try {
      console.log(`Uploading ${photo.title} (${photo.src})...`);
      const fileStream = fs.createReadStream(imagePath);
      const asset = await client.assets.upload("image", fileStream, {
        filename: photo.src,
      });

      console.log(`Creating document for ${photo.title}...`);
      const doc = {
        _type: "photo",
        title: photo.title,
        category: photo.category,
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        },
        alt: photo.alt,
        location: photo.location,
        featured: photo.featured,
        order: i + 1,
      };

      const result = await client.create(doc);
      console.log(`Successfully imported ${photo.title} (ID: ${result._id})`);
    } catch (error) {
      console.error(`Failed to import ${photo.title}:`, error);
    }
  }

  console.log("Import process complete!");
}

importPhotos().catch(console.error);
