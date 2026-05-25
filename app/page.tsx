"use client";

import { useState, useMemo } from "react";
import { photos, categories, type Category } from "@/lib/photos";
import GalleryGrid from "@/components/GalleryGrid";
import CategoryFilter from "@/components/CategoryFilter";
import styles from "./page.module.css";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filteredPhotos = useMemo(() => {
    if (activeCategory === "all") return photos;
    return photos.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: photos.length };
    for (const cat of categories.filter((c) => c !== "all")) {
      c[cat] = photos.filter((p) => p.category === cat).length;
    }
    return c;
  }, []);

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
