"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import styles from "./SwipeGrid.module.css";

interface EmptySwipeStateProps {
  filters: {
    activePhone: string;
    activeOrientation: string;
    phones: string[];
    orientations: string[];
  };
}

export default function EmptySwipeState({ filters }: EmptySwipeStateProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dragStartY = useRef<number | null>(null);

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

  return (
    <div
      className={styles.emptySwipeState}
      onWheel={(event) => {
        if (event.deltaY > 30) setFiltersOpen(true);
      }}
      onPointerDown={(event) => {
        dragStartY.current = event.clientY;
      }}
      onPointerUp={(event) => {
        if (dragStartY.current !== null && event.clientY - dragStartY.current > 72) {
          setFiltersOpen(true);
        }
        dragStartY.current = null;
      }}
      onPointerCancel={() => {
        dragStartY.current = null;
      }}
    >
      <p>No photos match these filters.</p>
      <p className={styles.emptySwipeHint}>Scroll down to change filters.</p>

      {filtersOpen && (
        <div
          className={styles.filterOverlay}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
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
                        filters.activeOrientation === orientation ? "all" : orientation,
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
    </div>
  );
}
