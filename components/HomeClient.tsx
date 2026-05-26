"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import type { LocalPhoto } from "@/lib/photos";
import CategoryFilter from "@/components/CategoryFilter";
import InstructionText from "@/components/InstructionText";
import styles from "@/app/page.module.css";

function subscribeToViewportChanges(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  window.addEventListener("orientationchange", onStoreChange);
  return () => {
    window.removeEventListener("resize", onStoreChange);
    window.removeEventListener("orientationchange", onStoreChange);
  };
}

function getIsMobileSnapshot() {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(any-pointer: coarse)").matches ||
    window.innerWidth <= 768
  );
}
function getIsMobileServerSnapshot() { return null; }

interface Props {
  photos: LocalPhoto[];
  content: { galleryTitle: string; galleryDescription: string; instructionText?: string };
  heroSrc: string;
}

export default function HomeClient({ photos, content, heroSrc }: Props) {
  const [activePhone, setActivePhone] = useState<string>("all");
  const [activeOrientation, setActiveOrientation] = useState<string>("all");

  const isMobile = useSyncExternalStore(
    subscribeToViewportChanges,
    getIsMobileSnapshot,
    getIsMobileServerSnapshot
  );

  const phoneCategories = useMemo(() => {
    const visible = photos.filter((p) => !p.hidden);
    const phones = Array.from(new Set(visible.map((p) => p.phone).filter(Boolean)));
    phones.sort();
    return phones;
  }, [photos]);

  const orientationCategories = useMemo(() => {
    const visible = photos.filter((p) => !p.hidden);
    const orientations = Array.from(new Set(visible.map((p) => p.category).filter(Boolean)));
    orientations.sort();
    return orientations;
  }, [photos]);

  const counts = useMemo(() => {
    const visible = photos.filter((p) => !p.hidden);
    const cnts: Record<string, number> = { all: visible.length };
    visible.forEach((p) => { if (p.phone) cnts[p.phone] = (cnts[p.phone] ?? 0) + 1; });
    return cnts;
  }, [photos]);

  const orientationCounts = useMemo(() => {
    const visible = photos.filter((p) => !p.hidden);
    const cnts: Record<string, number> = { all: visible.length };
    visible.forEach((p) => { if (p.category) cnts[p.category] = (cnts[p.category] ?? 0) + 1; });
    return cnts;
  }, [photos]);

  const buildSwipeUrl = () => {
    const params = new URLSearchParams();
    if (activePhone !== "all") params.set("phone", activePhone);
    if (activeOrientation !== "all") params.set("orientation", activeOrientation);
    const qs = params.toString();
    return `/swipe${qs ? `?${qs}` : ""}`;
  };

  const showFilters = isMobile !== true && (phoneCategories.length > 1 || orientationCategories.length > 1);

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

          {/* Filter pills — only on desktop */}
          {showFilters && (
            <div className={styles.homeFilters}>
              <CategoryFilter
                active={activePhone}
                onChange={setActivePhone}
                categories={phoneCategories}
                counts={counts}
                allLabel="All Phones"
              />
              <div className={styles.filterDivider} />
              <CategoryFilter
                active={activeOrientation}
                onChange={setActiveOrientation}
                categories={orientationCategories}
                counts={orientationCounts}
                allLabel="All Orientations"
              />
            </div>
          )}

          <a href={buildSwipeUrl()} className={styles.homeCta}>
            View Photos
          </a>

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
