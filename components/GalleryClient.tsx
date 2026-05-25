"use client";

import { useState, useMemo } from "react";
import type { SanityPhoto, Category } from "@/lib/sanity";
import GalleryGrid from "@/components/GalleryGrid";
import CategoryFilter from "@/components/CategoryFilter";
import styles from "@/app/page.module.css";

const categories: Category[] = ["all", "portrait", "landscape"];

export default function GalleryClient({ photos }: { photos: SanityPhoto[] }) {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filteredPhotos = useMemo(() => {
    if (activeCategory === "all") return photos;
    if (activeCategory === "portrait") {
      return photos.filter((p) => !(p.imageWidth && p.imageHeight ? p.imageWidth > p.imageHeight : false));
    }
    if (activeCategory === "landscape") {
      return photos.filter((p) => p.imageWidth && p.imageHeight ? p.imageWidth > p.imageHeight : false);
    }
    return photos;
  }, [activeCategory, photos]);

  const counts = useMemo(() => {
    const allCount = photos.length;
    const landscapeCount = photos.filter((p) => p.imageWidth && p.imageHeight ? p.imageWidth > p.imageHeight : false).length;
    const portraitCount = allCount - landscapeCount;
    return {
      all: allCount,
      portrait: portraitCount,
      landscape: landscapeCount,
    };
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
            active={activeCategory}
            onChange={setActiveCategory}
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
