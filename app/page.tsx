import fs from "fs";
import path from "path";
import { getLocalPhotos } from "@/lib/photos";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

export default async function HomePage() {
  const photos = await getLocalPhotos();

  const contentPath = path.join(process.cwd(), "data", "content.json");
  let content = {
    galleryTitle: "Daniel Rajakumar",
    galleryDescription:
      "A personal gallery of iPhone photos edited in Lightroom, with original comparisons for the shots that started on the camera roll.",
    instructionText: "",
  };
  if (fs.existsSync(contentPath)) {
    content = JSON.parse(fs.readFileSync(contentPath, "utf-8"));
  }

  const heroSrc = "/photos/001 - 2026-05-18 - InterVarsitys Basilia 2026/edited.jpg";

  return <HomeClient photos={photos} content={content} heroSrc={heroSrc} />;
}
