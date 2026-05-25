"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import styles from "./BeforeAfterImage.module.css";

interface Props {
  editedSrc: string;
  originalSrc: string;
  alt: string;
}

export default function BeforeAfterImage({ editedSrc, originalSrc, alt }: Props) {
  const [sliderPos, setSliderPos] = useState<number>(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setSliderPos(0);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    // Initialize slightly off-center for a nice effect if they enter from the side
    setSliderPos(50);
  };

  return (
    <div 
      className={styles.container} 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Bottom layer: Unedited (Original) */}
      <Image src={originalSrc} alt={`Unedited ${alt}`} fill className={styles.image} sizes="(max-width: 768px) 100vw, 50vw" />
      
      {/* Top layer: Edited */}
      <div 
        className={styles.editedWrapper}
        style={{
          clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`
        }}
      >
        <Image src={editedSrc} alt={alt} fill className={styles.image} sizes="(max-width: 768px) 100vw, 50vw" />
      </div>

      {/* Slider Line */}
      {isHovering && (
        <div className={styles.sliderLine} style={{ left: `${sliderPos}%` }}>
          <div className={styles.sliderHandle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 17l-5-5 5-5 M13 17l5-5-5-5" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
