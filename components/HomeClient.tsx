"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { LocalPhoto } from "@/lib/photos";
import InstructionText from "@/components/InstructionText";
import styles from "@/app/page.module.css";

interface Props {
  photos: LocalPhoto[];
  content: { galleryTitle: string; galleryDescription: string; instructionText?: string };
  heroSrc: string;
}

export default function HomeClient({ photos, content, heroSrc }: Props) {
  const swipeUrl = useMemo(() => {
    return photos.some((photo) => !photo.hidden) ? "/swipe" : "/photos";
  }, [photos]);

  return (
    <div className={styles.homePage}>
      <section className={styles.homeHero} aria-label="Daniel Rajakumar photography">
        <Image
          src={heroSrc}
          alt="A photo taken on an iPhone"
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
            {content.galleryDescription}
          </p>

          <a href={swipeUrl} className={styles.homeCta}>
            View Photos
          </a>

          <div className={styles.homeContactLinks} aria-label="Contact links">
            <a
              href="https://www.instagram.com/dan.photography.page?igsh=bmxtNmdjOHU0MzIz&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <a href="mailto:contact@danielrajakumar.com">
              contact@danielrajakumar.com
            </a>
          </div>

          {content.instructionText && (
            <div style={{ marginTop: "2rem" }}>
              <InstructionText text={content.instructionText} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
