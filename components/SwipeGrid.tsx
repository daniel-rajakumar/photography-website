"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import type { LocalPhoto } from "@/lib/photos";
import BeforeAfterImage from "./BeforeAfterImage";
import styles from "./SwipeGrid.module.css";

interface GalleryGridProps {
  photos: LocalPhoto[];
}

function parsePhotoDateTime(value?: string) {
  if (!value) return null;
  const exifMatch = value.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (exifMatch) {
    const [, year, month, day, hour, minute, second = "0"] = exifMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatCaptureDate(value?: string) {
  const date = parsePhotoDateTime(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date).toUpperCase();
}

function formatCaptureTime(value?: string) {
  const date = parsePhotoDateTime(value);
  if (!date) return "9:41";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

const VISIBLE_RANGE = 2; // how many cards to show on each side

export default function SwipeGrid({ photos }: GalleryGridProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [closedPhotoInfoIds, setClosedPhotoInfoIds] = useState<Set<string>>(() => new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const pointerStartX = useRef(0);
  const pointerStartY = useRef(0);
  const isDragIntent = useRef<"horizontal" | "vertical" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const togglePhotoInfo = (filename: string) => {
    setClosedPhotoInfoIds((current) => {
      const next = new Set(current);
      if (next.has(filename)) { next.delete(filename); } else { next.add(filename); }
      return next;
    });
  };

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(photos.length - 1, index)));
    setDragOffset(0);
    setIsDragging(false);
    isDragIntent.current = null;
  }, [photos.length]);

  // ── Pointer / touch handlers ──────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to touch / stylus, or primary mouse button
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    isDragIntent.current = null;
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - pointerStartX.current;
    const dy = e.clientY - pointerStartY.current;

    // Determine intent on first significant move
    if (isDragIntent.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isDragIntent.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
    }

    if (isDragIntent.current !== "horizontal") return;
    setIsDragging(true);
    setDragOffset(dx);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragIntent.current !== "horizontal") {
      setIsDragging(false);
      setDragOffset(0);
      isDragIntent.current = null;
      return;
    }
    const dx = e.clientX - pointerStartX.current;
    const threshold = (containerRef.current?.clientWidth ?? 300) * 0.2;
    if (dx < -threshold && currentIndex < photos.length - 1) {
      goTo(currentIndex + 1);
    } else if (dx > threshold && currentIndex > 0) {
      goTo(currentIndex - 1);
    } else {
      setDragOffset(0);
      setIsDragging(false);
      isDragIntent.current = null;
    }
  };

  // ── Card transform helper ─────────────────────────────────────────────────
  const getCardStyle = (offset: number): React.CSSProperties => {
    // offset = card index - currentIndex
    const absOffset = Math.abs(offset);

    // Live drag influence
    const dragInfluence = isDragging ? dragOffset / (containerRef.current?.clientWidth ?? 400) : 0;
    const effectiveOffset = offset - dragInfluence;
    const absEffective = Math.abs(effectiveOffset);

    const translateX = effectiveOffset * 70; // % of card width
    const rotateY = -effectiveOffset * 28;   // degrees
    const scale = Math.max(0.72, 1 - absEffective * 0.12);
    const translateZ = -absEffective * 80;   // px depth
    const opacity = absOffset > VISIBLE_RANGE ? 0 : Math.max(0.2, 1 - absEffective * 0.4);
    const zIndex = 100 - absOffset;

    return {
      position: "absolute",
      transform: `translateX(${translateX}%) rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px)`,
      opacity,
      zIndex,
      transition: isDragging ? "none" : "transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.55s ease",
      pointerEvents: absOffset > VISIBLE_RANGE ? "none" : "auto",
      willChange: "transform, opacity",
    };
  };

  return (
    <div
      ref={containerRef}
      className={styles.carouselContainer}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: "pan-y" }}
    >
      {/* 3-D Stage */}
      <div className={styles.stage}>
        {photos.map((photo, index) => {
          const offset = index - currentIndex;
          if (Math.abs(offset) > VISIBLE_RANGE + 1) return null;

          const imageUrl = photo.imagePath ?? `/photos/${photo.filename}`;
          const isHorizontal = photo.category === "landscape";
          const captureDate = formatCaptureDate(photo.date);
          const captureTime = formatCaptureTime(photo.date);
          const isInfoOpen = !closedPhotoInfoIds.has(photo.filename);

          return (
            <div key={photo.filename} style={getCardStyle(offset)} className={styles.cardWrapper}>
              <article className={styles.card} role="listitem">
                <div className={`${styles.phoneContainer} ${isHorizontal ? styles.landscape : ""}`}>
                  <div className={`${styles.physicalButton} ${styles.actionBtn}`} />
                  <div className={`${styles.physicalButton} ${styles.volumeUp}`} />
                  <div className={`${styles.physicalButton} ${styles.volumeDown}`} />
                  <div className={`${styles.physicalButton} ${styles.powerBtn}`} />

                  <div className={styles.phoneBezel}>
                    <button
                      className={`${styles.phoneScreen} ${isInfoOpen ? styles.showInfo : ""}`}
                      onClick={() => { if (!isDragging) togglePhotoInfo(photo.filename); }}
                      aria-label={`Toggle info for photo: ${photo.title}`}
                      id={`gallery-photo-${photo.filename}`}
                      data-phone-screen
                    >
                      {/* Status Bar */}
                      <div className={styles.statusBar}>
                        <span className={styles.time}>{captureTime}</span>
                        <div className={styles.statusIcons}>
                          <svg width="17" height="11" viewBox="0 0 17 11" className={styles.signalIcon}>
                            <path d="M1 9h1v2H1zm3-2h1v4H4zm3-2h1v6H7zm3-3h1v9h-1zm3-2h1v11h-1z" fill="currentColor" />
                          </svg>
                          <svg width="15" height="11" viewBox="0 0 15 11" className={styles.wifiIcon}>
                            <path d="M7.5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3.54-3.54a5 5 0 0 1 7.08 0l-1.06 1.06a3.5 3.5 0 0 0-4.96 0L3.96 7.46zm-2.12-2.12a8 8 0 0 1 11.32 0l-1.06 1.06a6.5 6.5 0 0 0-9.2 0L1.84 5.34z" fill="currentColor" />
                          </svg>
                          <div className={styles.batteryIcon}>
                            <div className={styles.batteryBody} />
                            <div className={styles.batteryTip} />
                          </div>
                        </div>
                      </div>

                      <div className={styles.dynamicIsland} />

                      {/* Image */}
                      <div className={`${styles.wallpaperWrapper} ${photo.hasOriginal ? styles.beforeAfterWallpaperWrapper : ""}`}>
                        {photo.hasOriginal ? (
                          <BeforeAfterImage
                            editedSrc={imageUrl}
                            originalSrc={photo.originalPath ?? `/photos/originals/${photo.filename}`}
                            alt={photo.alt}
                            isInfoOpen={isInfoOpen}
                            isLandscape={isHorizontal}
                            eager={index === 0}
                          />
                        ) : (
                          <Image
                            src={imageUrl}
                            alt={photo.alt}
                            fill
                            className={styles.wallpaper}
                            loading={index < 2 ? "eager" : "lazy"}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            sizes="(max-width: 768px) 100vw, 420px"
                          />
                        )}
                      </div>

                      {/* Info Panel */}
                      <div className={styles.infoWrapper}>
                        <div className={styles.infoPanel} onClick={(e) => e.stopPropagation()}>
                          <div className={styles.infoPanelInner}>
                            <div className={styles.infoRow}>
                              <h4 className={styles.infoTitle}>{photo.title}</h4>
                              {captureDate && <p className={styles.infoCaptureDate}>{captureDate}</p>}
                            </div>
                            <div className={styles.infoRow}>
                              <p className={styles.infoLocation}>
                                {photo.location ? photo.location.toUpperCase() : "UNKNOWN LOCATION"}
                              </p>
                              <p className={styles.infoDevice}>SHOT ON {photo.phone.toUpperCase()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!photo.hasOriginal && <div className={styles.homeIndicator} />}
                    </button>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className={styles.dots} aria-hidden="true">
        {photos.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to photo ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
