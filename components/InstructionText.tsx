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

const ACTION_PATTERN = /(CLICK|SWIPE DOWN|SWIPE UP|TAP|DRAG DOWN|DRAG UP|SWIPE|DRAG)/gi;
const HIGHLIGHTED_ACTIONS = ["CLICK", "SWIPE DOWN", "SWIPE UP", "TAP", "DRAG DOWN", "DRAG UP", "SWIPE", "DRAG"];

function getInstructionIcon(item: string) {
  const normalized = item.toUpperCase();

  if (normalized.includes("SWIPE DOWN") || normalized.includes("DRAG DOWN")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v13" />
        <path d="m7 11 5 5 5-5" />
        <path d="M8 21h8" />
      </svg>
    );
  }

  if (normalized.includes("SWIPE UP") || normalized.includes("DRAG UP")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21V8" />
        <path d="m7 13 5-5 5 5" />
        <path d="M8 3h8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 11V5a2 2 0 0 1 4 0v6" />
      <path d="M13 10V8a2 2 0 0 1 4 0v5" />
      <path d="M17 12v-1a2 2 0 0 1 4 0v4a6 6 0 0 1-6 6h-3a5 5 0 0 1-4.2-2.3L5 14a1.8 1.8 0 0 1 2.8-2.2L10 14" />
    </svg>
  );
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

  const instructionItems = processedText
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <ul className={styles.instructionText}>
      {instructionItems.map((item) => (
        <li key={item}>
          <span className={styles.instructionIcon}>{getInstructionIcon(item)}</span>
          <span>
          {item.split(ACTION_PATTERN).map((part, i) => {
            const p = part.toUpperCase();
            if (HIGHLIGHTED_ACTIONS.includes(p)) {
              return (
                <span key={i} className={styles.highlight}>
                  {part}
                </span>
              );
            }
            return part;
          })}
          </span>
        </li>
      ))}
    </ul>
  );
}
