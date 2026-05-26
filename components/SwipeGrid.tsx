"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LocalPhoto } from "@/lib/photos";
import BeforeAfterImage from "./BeforeAfterImage";
import styles from "./SwipeGrid.module.css";

interface GalleryGridProps {
  photos: LocalPhoto[];
  filters: {
    activePhone: string;
    activeOrientation: string;
    phones: string[];
    orientations: string[];
  };
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

export default function SwipeGrid({ photos, filters }: GalleryGridProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [closedPhotoInfoIds, setClosedPhotoInfoIds] = useState<Set<string>>(() => new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Drag state kept in a single ref to avoid stale closures
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    intent: null as "h" | "v" | null,
  });
  const [dragOffset, setDragOffset] = useState(0); // only for re-render

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(390);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateContainerWidth = () => {
      setContainerWidth(container.clientWidth || 390);
    };

    updateContainerWidth();
    const observer = new ResizeObserver(updateContainerWidth);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const togglePhotoInfo = (filename: string) => {
    setClosedPhotoInfoIds((current) => {
      const next = new Set(current);
      if (next.has(filename)) { next.delete(filename); } else { next.add(filename); }
      return next;
    });
  };

  const goTo = useCallback((index: number) => {
    const nextIndex = Math.max(0, Math.min(photos.length - 1, index));
    setCurrentIndex(nextIndex);
    drag.current.offsetX = 0;
    drag.current.offsetY = 0;
    drag.current.active = false;
    drag.current.intent = null;
    setDragOffset(0);
  }, [photos.length]);

  const getFilterHref = (next: { phone?: string; orientation?: string }) => {
    const params = new URLSearchParams();
    const phone = next.phone ?? filters.activePhone;
    const orientation = next.orientation ?? filters.activeOrientation;

    if (phone !== "all") params.set("phone", phone);
    if (orientation !== "all") params.set("orientation", orientation);

    const query = params.toString();
    return `/swipe${query ? `?${query}` : ""}`;
  };

  const closeFilters = () => setFiltersOpen(false);

  // ── Pointer handlers ──────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: 0,
      offsetY: 0,
      intent: null,
    };
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    // Determine intent once
    if (d.intent === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      d.intent = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
    }

    if (d.intent === "h") {
      d.offsetX = dx;
      setDragOffset(dx);
    } else if (d.intent === "v") {
      d.offsetY = dy;
    }
  };

  const handlePointerUp = () => {
    const d = drag.current;
    if (!d.active) return;

    const wasHorizontalDrag = d.intent === "h";
    const wasVerticalDrag = d.intent === "v";
    const dx = d.offsetX;
    const dy = d.offsetY;
    const width = containerWidth;
    const threshold = width * 0.15; // 15% of screen width

    if (wasHorizontalDrag) {
      if (dx < -threshold && currentIndex < photos.length - 1) {
        goTo(currentIndex + 1);
      } else if (dx > threshold && currentIndex > 0) {
        goTo(currentIndex - 1);
      } else if (dx > threshold && currentIndex === 0) {
        router.push("/");
      } else {
        // snap back in place
        drag.current.offsetX = 0;
        drag.current.offsetY = 0;
        drag.current.active = false;
        drag.current.intent = null;
        setDragOffset(0);
      }
    } else if (wasVerticalDrag && dy > Math.max(72, width * 0.08)) {
      setFiltersOpen(true);
      drag.current.active = false;
      drag.current.intent = null;
      drag.current.offsetY = 0;
    } else {
      drag.current.active = false;
      drag.current.intent = null;
    }
  };

  // ── Card transform ────────────────────────────────────────────────────────
  const getCardStyle = (offset: number): React.CSSProperties => {
    // Normalize drag offset to fraction of card width
    const dragFraction = dragOffset / containerWidth;

    // Positive dragFraction = user dragging right = cards move right = effectiveOffset increases
    const effectiveOffset = offset + dragFraction;
    const absEff = Math.abs(effectiveOffset);

    const translateX    = effectiveOffset * 78;           // % of card width
    const rotateY       = -effectiveOffset * 25;          // deg
    const scale         = Math.max(0.72, 1 - absEff * 0.11);
    const translateZ    = Math.min(0, -absEff * 60);      // px depth
    const opacity       = Math.max(0, 1 - absEff * 0.45);
    const zIndex        = Math.round(100 - Math.abs(offset) * 10);
    const isSettled     = dragOffset === 0;

    return {
      position: "absolute",
      transform: `translateX(${translateX}%) rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px)`,
      opacity,
      zIndex,
      transition: isSettled
        ? "transform 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.48s ease"
        : "none",
      pointerEvents: Math.abs(offset) > VISIBLE_RANGE ? "none" : "auto",
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
      style={{ touchAction: "none" }}
    >
      {filtersOpen && (
        <div
          className={styles.filterOverlay}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          <div
            id="swipe-filter-menu"
            className={styles.filterMenu}
            role="dialog"
            aria-label="Photo filters"
            aria-modal="true"
          >
            <div className={styles.filterHeader}>
              <p className={styles.filterTitle}>Filters</p>
              <button
                type="button"
                className={styles.filterClose}
                onClick={closeFilters}
                aria-label="Close filters"
              >
                Close
              </button>
            </div>

            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Phone</p>
              <div className={styles.filterOptions}>
                {filters.phones.map((phone) => (
                  <Link
                    key={phone}
                    href={getFilterHref({
                      phone: filters.activePhone === phone ? "all" : phone,
                    })}
                    onClick={closeFilters}
                    className={`${styles.filterOption} ${
                      filters.activePhone === phone ? styles.filterOptionActive : ""
                    }`}
                  >
                    {phone}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Orientation</p>
              <div className={styles.filterOptions}>
                {filters.orientations.map((orientation) => (
                  <Link
                    key={orientation}
                    href={getFilterHref({
                      orientation:
                        filters.activeOrientation === orientation
                          ? "all"
                          : orientation,
                    })}
                    onClick={closeFilters}
                    className={`${styles.filterOption} ${
                      filters.activeOrientation === orientation
                        ? styles.filterOptionActive
                        : ""
                    }`}
                  >
                    {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/swipe" onClick={closeFilters} className={styles.clearFilters}>
              Clear Filters
            </Link>
          </div>
        </div>
      )}

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
                      onClick={() => { if (!drag.current.active) togglePhotoInfo(photo.filename); }}
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

    </div>
  );
}
