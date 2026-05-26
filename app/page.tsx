import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import InstructionText from "@/components/InstructionText";
import styles from "./page.module.css";

export default function HomePage() {
  const dataFile = path.join(process.cwd(), "data", "content.json");
  const content = JSON.parse(fs.readFileSync(dataFile, "utf-8"));

  return (
    <div className={styles.homePage}>
      <section className={styles.homeHero} aria-label="Daniel Rajakumar photography">
        <Image
          src="/photos/001 - 2026-05-18 - InterVarsitys Basilia 2026/edited.jpg"
          alt="Billiards room photographed on an iPhone"
          fill
          priority
          sizes="100vw"
          className={styles.homeHeroImage}
        />
        <div className={styles.homeHeroOverlay} />

        <div className={styles.homeHeroContent}>
          <p className={styles.homeEyebrow}>Phone Photography</p>
          <h1 className={styles.homeTitle}>{content.galleryTitle || "Daniel Rajakumar"}</h1>
          <p className={styles.homeDescription}>
            {content.galleryDescription || "A personal gallery of iPhone photos edited in Lightroom, with original comparisons for the shots that started on the camera roll."}
          </p>
          
          <Link href="/photos" className={styles.homeCta}>
            View Photos
          </Link>

          {content.instructionText && (
            <div style={{ marginTop: "3rem" }}>
              <InstructionText text={content.instructionText} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
