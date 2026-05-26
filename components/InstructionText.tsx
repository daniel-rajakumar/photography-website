"use client";

import { useSyncExternalStore } from "react";
import styles from "@/app/page.module.css";

function subscribeToViewportChanges(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getIsMobileSnapshot() {
  return window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
}

function getIsMobileServerSnapshot() {
  return null;
}

export default function InstructionText({ text }: { text: string }) {
  const isMobile = useSyncExternalStore(
    subscribeToViewportChanges,
    getIsMobileSnapshot,
    getIsMobileServerSnapshot
  );

  let processedText = text;
  if (isMobile === true) {
    processedText = processedText.replace(/\bCLICK\b/gi, "TAP").replace(/\bDRAG\b/gi, "SWIPE");
  } else if (isMobile === false) {
    processedText = processedText.replace(/\bTAP\b/gi, "CLICK").replace(/\bSWIPE\b/gi, "DRAG");
  }

  const parts = processedText.split(/(CLICK|SWIPE UP|TAP|DRAG UP|SWIPE|DRAG)/gi);

  return (
    <p className={styles.instructionText}>
      {parts.map((part, i) => {
        const p = part.toUpperCase();
        if (["CLICK", "SWIPE UP", "TAP", "DRAG UP", "SWIPE", "DRAG"].includes(p)) {
          return (
            <span key={i} className={styles.highlight}>
              {part}
            </span>
          );
        }
        return part;
      })}
    </p>
  );
}
