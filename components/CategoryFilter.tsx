"use client";

import { categories, type Category } from "@/lib/photos";
import styles from "./CategoryFilter.module.css";

interface CategoryFilterProps {
  active: Category;
  onChange: (category: Category) => void;
  counts: Record<string, number>;
}

const LABELS: Record<Category, string> = {
  all: "All Work",
  landscape: "Landscape",
  portrait: "Portrait",
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
