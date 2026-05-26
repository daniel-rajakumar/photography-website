"use client";

import { useSyncExternalStore } from "react";
import styles from "./RotateLock.module.css";

function subscribe(cb: () => void) {
  window.addEventListener("orientationchange", cb);
  window.addEventListener("resize", cb);
  return () => {
    window.removeEventListener("orientationchange", cb);
    window.removeEventListener("resize", cb);
  };
}

function getIsLandscape() {
  const isMobile =
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(any-pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0;

  if (!isMobile) return false; // desktops are always fine

  if (typeof screen !== "undefined" && screen.orientation) {
    return screen.orientation.type.startsWith("landscape");
  }
  return window.innerWidth > window.innerHeight;
}

function getServerSnapshot() {
  return false;
}

export default function RotateLock({ children }: { children: React.ReactNode }) {
  const isLandscape = useSyncExternalStore(subscribe, getIsLandscape, getServerSnapshot);

  if (isLandscape) {
    return (
      <div className={styles.overlay}>
        <div className={styles.content}>
          <div className={styles.phoneIcon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="7" y="2" width="10" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="17.5" r="0.75" fill="currentColor"/>
            </svg>
          </div>
          <p className={styles.message}>Please rotate your phone to portrait mode</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
