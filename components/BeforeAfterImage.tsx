"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import styles from "./BeforeAfterImage.module.css";

interface Props {
  editedSrc: string;
  originalSrc: string;
  alt: string;
  isInfoOpen?: boolean;
  isLandscape?: boolean;
}

export default function BeforeAfterImage({
  editedSrc,
  originalSrc,
  alt,
  isInfoOpen = false,
  isLandscape = false,
}: Props) {
  const [sliderPos, setSliderPos] = useState<number>(100);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startPos, setStartPos] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasDraggedRef = useRef(false);
  const clearDragTimeoutRef = useRef<number | null>(null);
  const [sliderRoot, setSliderRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSliderRoot(containerRef.current?.closest("[data-phone-screen]") as HTMLElement | null);

    return () => {
      if (clearDragTimeoutRef.current !== null) {
        window.clearTimeout(clearDragTimeoutRef.current);
      }
    };
  }, []);

  const updatePos = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Check if the phone container is physically rotated 90deg (mobile landscape)
    const isRotated = window.innerWidth <= 768 && !!containerRef.current.closest('[class*="landscape"]');
    
    let deltaPercent = 0;
    if (isRotated) {
      // Container is rotated 90deg
      // Bottom of phone is on the left, Top of phone is on the right
      // Dragging Right (positive deltaX) moves towards Top (0%)
      const deltaX = clientX - startX;
      deltaPercent = -(deltaX / rect.width) * 100;
    } else {
      // Portrait mode or Desktop Landscape (unrotated)
      const deltaY = clientY - startY;
      deltaPercent = (deltaY / rect.height) * 100;
    }
    
    const newPercent = Math.max(0, Math.min(100, startPos + deltaPercent));
    setSliderPos(newPercent);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    hasDraggedRef.current = false;
    if (clearDragTimeoutRef.current !== null) {
      window.clearTimeout(clearDragTimeoutRef.current);
      clearDragTimeoutRef.current = null;
    }
    setStartX(e.clientX);
    setStartY(e.clientY);
    setStartPos(sliderPos);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      if (Math.abs(e.clientY - startY) > 5 || Math.abs(e.clientX - startX) > 5) {
        hasDraggedRef.current = true;
      }
      updatePos(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (hasDraggedRef.current) {
      clearDragTimeoutRef.current = window.setTimeout(() => {
        hasDraggedRef.current = false;
        clearDragTimeoutRef.current = null;
      }, 250);
    }
    
    if (sliderPos < 50) {
      setSliderPos(0);
    } else {
      setSliderPos(100);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDraggedRef.current = false;
    }
  };

  const sliderLine = (
    <div
      className={styles.sliderLine}
      style={{
        top: `max(${isLandscape ? 22 : 55}px, ${sliderPos}%)`,
        transition: isDragging ? "none" : "top 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className={styles.sliderHandle} />
    </div>
  );

  return (
    <div 
      className={`${styles.container} ${isInfoOpen ? styles.infoOpen : ""}`}
      style={{
        "--before-after-info-shift": isLandscape ? "-50px" : "-62px",
      } as React.CSSProperties}
      ref={containerRef}
      onClick={handleClick}
    >
      {/* Bottom layer: Unedited (Original) */}
      <Image src={originalSrc} alt={`Unedited ${alt}`} fill className={styles.image} sizes="(max-width: 768px) 100vw, 50vw" />
      
      {/* Top layer: Edited */}
      <div 
        className={styles.editedWrapper}
        style={{
          clipPath: `polygon(0 0, 100% 0, 100% ${sliderPos}%, 0 ${sliderPos}%)`,
          transition: isDragging ? "none" : "clip-path 0.4s cubic-bezier(0.32, 0.72, 0, 1)"
        }}
      >
        <Image src={editedSrc} alt={alt} fill className={styles.image} sizes="(max-width: 768px) 100vw, 50vw" />
      </div>

      {sliderRoot ? createPortal(sliderLine, sliderRoot) : sliderLine}
    </div>
  );
}
