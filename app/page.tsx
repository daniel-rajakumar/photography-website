import { getAllPhotos } from "@/lib/sanity";
import GalleryClient from "@/components/GalleryClient";

// Revalidate every 60s so new Sanity photos show up automatically
export const revalidate = 60;

export default async function GalleryPage() {
  const photos = await getAllPhotos();
  return <GalleryClient photos={photos} />;
}
