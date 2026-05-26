"use client";

import { useState, useMemo } from "react";
import type { LocalPhoto } from "@/lib/photos";
import GalleryGrid from "@/components/GalleryGrid";
import CategoryFilter from "@/components/CategoryFilter";
import styles from "@/app/page.module.css";

export default function GalleryClient({ 
  photos, 
  content 
}: { 
  photos: LocalPhoto[];
  content: { galleryTitle: string; galleryDescription: string };
}) {
  const [activePhone, setActivePhone] = useState<string>("all");

  const phoneCategories = useMemo(() => {
    const visiblePhotos = photos.filter((p) => !p.hidden);
    const phones = Array.from(new Set(visiblePhotos.map((p) => p.phone).filter(Boolean)));
    phones.sort();
    return ["all", ...phones];
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    let result = photos.filter((p) => !p.hidden);
    if (activePhone !== "all") {
      result = result.filter((p) => p.phone === activePhone);
    }
    
    // Sort logic: featured photos first, then preserve the original order (which is by uploadIndex/order from server)
    // We use a stable sort approach
    return [...result].sort((a, b) => {
      // 1. Featured items come first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // 2. Order field (lower numbers come first)
      if (a.order !== b.order) return (a.order || 999) - (b.order || 999);
      
      // 3. Fallback to uploadIndex (descending) as it was originally
      return (b.uploadIndex || 0) - (a.uploadIndex || 0);
    });
  }, [activePhone, photos]);

  const counts = useMemo(() => {
    const visiblePhotos = photos.filter((p) => !p.hidden);
    const cnts: Record<string, number> = { all: visiblePhotos.length };
    visiblePhotos.forEach((p) => {
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
          <h1 className={styles.pageTitle}>{content.galleryTitle}</h1>
          <p className={styles.pageDesc}>
            {content.galleryDescription}
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
