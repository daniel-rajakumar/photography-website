"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/photos";
import LightBox from "./LightBox";
import styles from "./GalleryGrid.module.css";

interface GalleryGridProps {
  photos: Photo[];
}

export default function GalleryGrid({ photos }: GalleryGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <>
      <div className={styles.grid} role="list" aria-label="Photo gallery">
        {photos.map((photo, index) => (
          <article
            key={photo.id}
            className={styles.card}
            role="listitem"
            style={{ animationDelay: `${Math.min(index * 0.06, 0.5)}s` }}
          >
            <button
              className={styles.cardBtn}
              onClick={() => setSelectedPhoto(photo)}
              aria-label={`View photo: ${photo.title}`}
              id={`gallery-photo-${photo.id}`}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  className={styles.image}
                  loading={index < 4 ? "eager" : "lazy"}
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className={styles.overlay} aria-hidden="true">
                  <div className={styles.overlayContent}>
                    <span className={styles.eyebrow}>{photo.category}</span>
                    <h3 className={styles.title}>{photo.title}</h3>
                    {photo.location && (
                      <span className={styles.location}>{photo.location}</span>
                    )}
                  </div>
                  <div className={styles.expandIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M10.5 3H15V7.5M7.5 15H3V10.5M15 3L9 9M3 15L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </article>
        ))}
      </div>

      <LightBox
        photo={selectedPhoto}
        photos={photos}
        onClose={() => setSelectedPhoto(null)}
        onNavigate={setSelectedPhoto}
      />
    </>
  );
}
