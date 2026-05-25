"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { SanityPhoto } from "@/lib/sanity";
import { urlFor } from "@/lib/sanity";
import styles from "./LightBox.module.css";

interface LightBoxProps {
  photo: SanityPhoto | null;
  photos: SanityPhoto[];
  onClose: () => void;
  onNavigate: (photo: SanityPhoto) => void;
}

export default function LightBox({ photo, photos, onClose, onNavigate }: LightBoxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const currentIndex = photo ? photos.findIndex((p) => p._id === photo._id) : -1;
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < photos.length - 1;

  const goNext = useCallback(() => {
    if (canNext) onNavigate(photos[currentIndex + 1]);
  }, [canNext, currentIndex, onNavigate, photos]);

  const goPrev = useCallback(() => {
    if (canPrev) onNavigate(photos[currentIndex - 1]);
  }, [canPrev, currentIndex, onNavigate, photos]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (photo) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [photo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!photo) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [photo, goNext, goPrev]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  const imageUrl = photo
    ? urlFor(photo.image).width(1600).auto("format").url()
    : null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={handleBackdropClick}
      aria-label={photo ? `Lightbox: ${photo.title}` : "Image lightbox"}
    >
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close lightbox"
          id="lightbox-close-btn"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 3L17 17M17 3L3 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Prev */}
        <button
          className={`${styles.navBtn} ${styles.prevBtn}`}
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="Previous photo"
          id="lightbox-prev-btn"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path d="M14 4L7 11L14 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Image */}
        <div className={styles.imageWrapper}>
          {photo && imageUrl && (
            <Image
              key={photo._id}
              src={imageUrl}
              alt={photo.alt}
              width={photo.imageWidth || 1600}
              height={photo.imageHeight || 1200}
              className={styles.image}
              priority
              sizes="(max-width: 768px) 100vw, 90vw"
            />
          )}
        </div>

        {/* Next */}
        <button
          className={`${styles.navBtn} ${styles.nextBtn}`}
          onClick={goNext}
          disabled={!canNext}
          aria-label="Next photo"
          id="lightbox-next-btn"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path d="M8 4L15 11L8 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Caption */}
        {photo && (
          <div className={styles.caption}>
            <span className={styles.captionTitle}>{photo.title}</span>
            {photo.location && (
              <span className={styles.captionLocation}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{display:"inline",marginRight:4}}>
                  <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5C2.5 7 6 11 6 11C6 11 9.5 7 9.5 4.5C9.5 2.57 7.93 1 6 1ZM6 6C5.17 6 4.5 5.33 4.5 4.5C4.5 3.67 5.17 3 6 3C6.83 3 7.5 3.67 7.5 4.5C7.5 5.33 6.83 6 6 6Z" fill="currentColor"/>
                </svg>
                {photo.location}
              </span>
            )}
            <span className={styles.captionCounter}>
              {currentIndex + 1} / {photos.length}
            </span>
          </div>
        )}
      </div>
    </dialog>
  );
}
