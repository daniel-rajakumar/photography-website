"use client";

import { useState } from "react";
import Image from "next/image";
import type { LocalPhoto } from "@/lib/photos";
import BeforeAfterImage from "./BeforeAfterImage";
import styles from "./GalleryGrid.module.css";

interface GalleryGridProps {
  photos: LocalPhoto[];
}

function parsePhotoDateTime(value?: string) {
  if (!value) return null;

  const exifMatch = value.match(
    /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (exifMatch) {
    const [, year, month, day, hour, minute, second = "0"] = exifMatch;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatCaptureDate(value?: string) {
  const date = parsePhotoDateTime(value);

  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

function formatCaptureTime(value?: string) {
  const date = parsePhotoDateTime(value);

  if (!date) return "9:41";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function GalleryGrid({ photos }: GalleryGridProps) {
  const [closedPhotoInfoIds, setClosedPhotoInfoIds] = useState<Set<string>>(
    () => new Set()
  );

  const togglePhotoInfo = (filename: string) => {
    setClosedPhotoInfoIds((current) => {
      const next = new Set(current);
      if (next.has(filename)) {
        next.delete(filename);
      } else {
        next.add(filename);
      }
      return next;
    });
  };

  return (
    <>
      <div className={styles.grid} role="list" aria-label="Photo gallery">
        {photos.map((photo, index) => {
          const imageUrl = photo.imagePath ?? `/photos/${photo.filename}`;
          const isHorizontal = photo.category === "landscape";
          const captureDate = formatCaptureDate(photo.date);
          const captureTime = formatCaptureTime(photo.date);
          const isInfoOpen = !closedPhotoInfoIds.has(photo.filename);

          return (
            <article
              key={photo.filename}
              className={styles.card}
              role="listitem"
              style={{ animationDelay: `${Math.min(index * 0.1, 0.8)}s` }}
            >
              {/* iPhone 15 Frame container */}
              <div className={`${styles.phoneContainer} ${isHorizontal ? styles.landscape : ""}`}>
                {/* Physical buttons on the sides */}
                <div className={`${styles.physicalButton} ${styles.actionBtn}`} />
                <div className={`${styles.physicalButton} ${styles.volumeUp}`} />
                <div className={`${styles.physicalButton} ${styles.volumeDown}`} />
                <div className={`${styles.physicalButton} ${styles.powerBtn}`} />

                {/* Outer Titanium Bezel */}
                <div className={styles.phoneBezel}>
                  {/* Screen Content */}
                  <button
                    className={`${styles.phoneScreen} ${isInfoOpen ? styles.showInfo : ""}`}
                    onClick={() => togglePhotoInfo(photo.filename)}
                    aria-label={`Toggle info for photo: ${photo.title}`}
                    id={`gallery-photo-${photo.filename}`}
                    data-phone-screen
                  >
                    {/* Status Bar */}
                    <div className={styles.statusBar}>
                      <span className={styles.time}>{captureTime}</span>
                      <div className={styles.statusIcons}>
                        {/* Signal Strength */}
                        <svg width="17" height="11" viewBox="0 0 17 11" className={styles.signalIcon}>
                          <path d="M1 9h1v2H1zm3-2h1v4H4zm3-2h1v6H7zm3-3h1v9h-1zm3-2h1v11h-1z" fill="currentColor" />
                        </svg>
                        {/* Wifi */}
                        <svg width="15" height="11" viewBox="0 0 15 11" className={styles.wifiIcon}>
                          <path d="M7.5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3.54-3.54a5 5 0 0 1 7.08 0l-1.06 1.06a3.5 3.5 0 0 0-4.96 0L3.96 7.46zm-2.12-2.12a8 8 0 0 1 11.32 0l-1.06 1.06a6.5 6.5 0 0 0-9.2 0L1.84 5.34z" fill="currentColor" />
                        </svg>
                        {/* Battery */}
                        <div className={styles.batteryIcon}>
                          <div className={styles.batteryBody} />
                          <div className={styles.batteryTip} />
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Island */}
                    <div className={styles.dynamicIsland} />



                    {/* Image Wallpaper */}
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

                    {/* Image Info Panel (revealed on hover/swipe up) */}
                    <div className={styles.infoWrapper}>
                      <div className={styles.infoPanel} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.infoPanelInner}>
                          <div className={styles.infoRow}>
                            <h4 className={styles.infoTitle}>{photo.title}</h4>
                            {captureDate && (
                              <p className={styles.infoCaptureDate}>{captureDate}</p>
                            )}
                          </div>
                          <div className={styles.infoRow}>
                            <p className={styles.infoLocation}>
                              {photo.location ? (
                                <>{photo.location.toUpperCase()}</>
                              ) : "UNKNOWN LOCATION"}
                            </p>
                            <p className={styles.infoDevice}>SHOT ON {photo.phone.toUpperCase()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Home Indicator bar */}
                    {!photo.hasOriginal && <div className={styles.homeIndicator} />}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
