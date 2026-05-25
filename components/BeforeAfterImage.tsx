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
  const [sliderPos, setSliderPos] = useState<number>(100);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePos = (clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaY = clientY - startY;
    const deltaPercent = (deltaY / rect.height) * 100;
    
    // Start from 100% (bottom), apply drag delta, clamp between 0 and 100
    const newPercent = Math.max(0, Math.min(100, 100 + deltaPercent));
    setSliderPos(newPercent);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setHasDragged(false);
    setStartY(e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      if (Math.abs(e.clientY - startY) > 5) {
        setHasDragged(true);
      }
      updatePos(e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    setSliderPos(100);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setSliderPos(100);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasDragged) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div 
      className={styles.container} 
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ touchAction: "none" }} // prevent page scroll when dragging on mobile
    >
      {/* Bottom layer: Unedited (Original) */}
      <Image src={originalSrc} alt={`Unedited ${alt}`} fill className={styles.image} sizes="(max-width: 768px) 100vw, 50vw" />
      
      {/* Top layer: Edited */}
      <div 
        className={styles.editedWrapper}
        style={{
          clipPath: `polygon(0 0, 100% 0, 100% ${sliderPos}%, 0 ${sliderPos}%)`
        }}
      >
        <Image src={editedSrc} alt={alt} fill className={styles.image} sizes="(max-width: 768px) 100vw, 50vw" />
      </div>

      {/* Slider Line (Acts as Home Indicator) */}
      <div className={styles.sliderLine} style={{ top: `${sliderPos}%` }}>
        <div className={styles.sliderHandle} />
      </div>
    </div>
  );
}
