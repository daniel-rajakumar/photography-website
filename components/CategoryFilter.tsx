"use client";

import { type Category } from "@/lib/sanity";
import styles from "./CategoryFilter.module.css";

const categories: Category[] = ["all", "portrait", "landscape"];

interface CategoryFilterProps {
  active: Category;
  onChange: (category: Category) => void;
  counts: Record<string, number>;
}

const LABELS: Record<Category, string> = {
  all: "All Screens",
  portrait: "Portrait Phone",
  landscape: "Landscape Phone",
  street: "Street",
  abstract: "Abstract",
  architecture: "Architecture",
};

export default function CategoryFilter({ active, onChange, counts }: CategoryFilterProps) {
  return (
    <nav className={styles.filterNav} aria-label="Filter photos by category">
      <div className={styles.track} role="list">
        {categories.map((cat) => (
          <button
            key={cat}
            role="listitem"
            className={`${styles.pill} ${active === cat ? styles.pillActive : ""}`}
            onClick={() => onChange(cat)}
            aria-pressed={active === cat}
            aria-label={`Filter: ${LABELS[cat]}`}
            id={`filter-pill-${cat}`}
          >
            <span>{LABELS[cat]}</span>
            <span className={styles.count}>{counts[cat] ?? 0}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
