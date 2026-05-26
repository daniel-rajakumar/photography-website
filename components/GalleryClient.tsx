"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import type { LocalPhoto } from "@/lib/photos";
import GalleryGrid from "@/components/GalleryGrid";
import CategoryFilter from "@/components/CategoryFilter";
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
    window.innerWidth <= 768 ||
    Math.min(window.innerWidth, window.innerHeight) <= 480
  );
}

function getIsMobileServerSnapshot() {
  return null;
}

function getDeviceOrientationSnapshot() {
  return window.matchMedia("(orientation: landscape)").matches
    ? "landscape"
    : "portrait";
}

function getDeviceOrientationServerSnapshot() {
  return null;
}

export default function GalleryClient({ 
  photos, 
  content 
}: { 
  photos: LocalPhoto[];
  content: { galleryTitle: string; galleryDescription: string; instructionText?: string };
}) {
  const [activePhone, setActivePhone] = useState<string>("all");
  const [activeOrientation, setActiveOrientation] = useState<string>("all");
  const isMobile = useSyncExternalStore(
    subscribeToViewportChanges,
    getIsMobileSnapshot,
    getIsMobileServerSnapshot
  );
  const deviceOrientation = useSyncExternalStore(
    subscribeToViewportChanges,
    getDeviceOrientationSnapshot,
    getDeviceOrientationServerSnapshot
  );
  const shouldUseDeviceOrientation = isMobile === true;
  const shouldShowFilters = isMobile !== true;
  const effectiveOrientation =
    shouldUseDeviceOrientation ? deviceOrientation : activeOrientation;

  const phoneCategories = useMemo(() => {
    const visiblePhotos = photos.filter((p) => !p.hidden);
    const phones = Array.from(new Set(visiblePhotos.map((p) => p.phone).filter(Boolean)));
    phones.sort();
    return phones;
  }, [photos]);

  const orientationCategories = useMemo(() => {
    const visiblePhotos = photos.filter((p) => !p.hidden);
    const orientations = Array.from(new Set(visiblePhotos.map((p) => p.category).filter(Boolean)));
    orientations.sort();
    return orientations;
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    let result = photos.filter((p) => !p.hidden);
    if (!shouldUseDeviceOrientation && activePhone !== "all") {
      result = result.filter((p) => p.phone === activePhone);
    }
    if (effectiveOrientation && effectiveOrientation !== "all") {
      result = result.filter((p) => p.category === effectiveOrientation);
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
  }, [activePhone, effectiveOrientation, photos, shouldUseDeviceOrientation]);

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

  const orientationCounts = useMemo(() => {
    const visiblePhotos = photos.filter((p) => !p.hidden);
    const cnts: Record<string, number> = { all: visiblePhotos.length };
    visiblePhotos.forEach((p) => {
      if (p.category) {
         cnts[p.category] = (cnts[p.category] ?? 0) + 1;
      }
    });
    return cnts;
  }, [photos]);



  return (
    <div className={styles.page}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>{content.galleryTitle || "Phone Photography"}</h1>
          {content.galleryDescription && (
            <p className={styles.pageDesc}>{content.galleryDescription}</p>
          )}
        </div>
      </header>

      {/* Filter + Grid */}
      <section className={styles.gallerySection} aria-label="Photo gallery">
        {shouldShowFilters && (
          <div className={`${styles.filterBar} container`}>
            <div className={styles.filterGroups}>
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
          </div>
        )}

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
