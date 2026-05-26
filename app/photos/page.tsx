import fs from "fs";
import path from "path";
import { getLocalPhotos } from "@/lib/photos";
import GalleryClient from "@/components/GalleryClient";

// Revalidate every 60s so new Sanity photos show up automatically
export const revalidate = 60;

export default async function PhotosPage() {
  const photos = await getLocalPhotos();

  const contentPath = path.join(process.cwd(), "data", "content.json");
  let content = {
    galleryTitle: "The Gallery",
    galleryDescription:
      "A complete collection spanning landscapes, portraits, street scenes, abstract macro work, and architectural studies.",
    instructionText: "Drag the white line to see unedited photo",
  };

  if (fs.existsSync(contentPath)) {
    content = JSON.parse(fs.readFileSync(contentPath, "utf-8"));
  }

  return <GalleryClient photos={photos} content={content} />;
}
