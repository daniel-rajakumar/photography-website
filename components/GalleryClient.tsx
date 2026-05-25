"use client";

import { useState, useMemo } from "react";
import type { LocalPhoto } from "@/lib/photos";
import GalleryGrid from "@/components/GalleryGrid";
import CategoryFilter from "@/components/CategoryFilter";
import styles from "@/app/page.module.css";

export default function GalleryClient({ photos }: { photos: LocalPhoto[] }) {
  const [activePhone, setActivePhone] = useState<string>("all");

  const phoneCategories = useMemo(() => {
    const phones = Array.from(new Set(photos.map((p) => p.phone).filter(Boolean)));
    phones.sort();
    return ["all", ...phones];
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (activePhone === "all") return photos;
    return photos.filter((p) => p.phone === activePhone);
  }, [activePhone, photos]);

  const counts = useMemo(() => {
    const cnts: Record<string, number> = { all: photos.length };
    photos.forEach((p) => {
      if (p.phone) {
         cnts[p.phone] = (cnts[p.phone] ?? 0) + 1;
      }
    });
    return cnts;
  }, [photos]);

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <div className="container">
          <p className="eyebrow">Portfolio</p>
          <div className="divider" />
          <h1 className={styles.pageTitle}>The Gallery</h1>
          <p className={styles.pageDesc}>
            A complete collection spanning landscapes, portraits, street scenes,
            abstract macro work, and architectural studies.
          </p>
        </div>
      </header>

      {/* Filter + Grid */}
      <section className={styles.gallerySection} aria-label="Photo gallery">
        <div className={`${styles.filterBar} container`}>
          <CategoryFilter
            active={activePhone}
            onChange={setActivePhone}
            categories={phoneCategories}
            counts={counts}
          />
          <span className={styles.resultCount} aria-live="polite">
            {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredPhotos.length > 0 ? (
          <GalleryGrid photos={filteredPhotos} />
        ) : (
          <div className={styles.empty}>
            <p>No photos in this category yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
