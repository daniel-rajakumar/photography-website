"use client";

import { useState } from "react";
import Image from "next/image";
import type { SanityPhoto } from "@/lib/sanity";
import { urlFor } from "@/lib/sanity";
import LightBox from "./LightBox";
import styles from "./GalleryGrid.module.css";

interface GalleryGridProps {
  photos: SanityPhoto[];
}

export default function GalleryGrid({ photos }: GalleryGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<SanityPhoto | null>(null);

  return (
    <>
      <div className={styles.grid} role="list" aria-label="Photo gallery">
        {photos.map((photo, index) => {
          const imageUrl = urlFor(photo.image).auto("format").url();
          const isHorizontal = photo.imageWidth && photo.imageHeight ? photo.imageWidth > photo.imageHeight : false;

          return (
            <article
              key={photo._id}
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
                    className={styles.phoneScreen}
                    onClick={() => setSelectedPhoto(photo)}
                    aria-label={`View photo: ${photo.title}`}
                    id={`gallery-photo-${photo._id}`}
                  >
                    {/* Status Bar */}
                    <div className={styles.statusBar}>
                      <span className={styles.time}>9:41</span>
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

                    {/* iOS Slide-down Notification Banner (Image Info) */}
                    <div className={styles.notificationBanner}>
                      <div className={styles.notificationHeader}>
                        <div className={styles.appIcon}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 4h3l2-3h6l2 3h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
                          </svg>
                        </div>
                        <span className={styles.appName}>Lumina Camera</span>
                        <span className={styles.notificationTime}>now</span>
                      </div>
                      <div className={styles.notificationBody}>
                        <h4 className={styles.photoTitle}>{photo.title}</h4>
                        <p className={styles.photoMeta}>
                          {photo.location ? `${photo.location} • ` : ""}{photo.phone}
                        </p>
                      </div>
                    </div>

                    {/* Image Wallpaper */}
                    <div className={styles.wallpaperWrapper}>
                      <Image
                        src={imageUrl}
                        alt={photo.alt}
                        fill
                        className={styles.wallpaper}
                        loading={index < 2 ? "eager" : "lazy"}
                        priority={index === 0}
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 420px"
                      />
                    </div>

                    {/* Home Indicator bar */}
                    <div className={styles.homeIndicator} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
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
