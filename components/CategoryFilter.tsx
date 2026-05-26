"use client";

import styles from "./CategoryFilter.module.css";

interface CategoryFilterProps {
  active: string;
  onChange: (category: string) => void;
  categories: string[];
  counts: Record<string, number>;
  allLabel?: string;
}

export default function CategoryFilter({
  active,
  onChange,
  categories,
  counts,
  allLabel = "All",
}: CategoryFilterProps) {
  const getLabel = (cat: string) => {
    if (cat === "all") return allLabel;
    if (cat === "landscape" || cat === "portrait") {
      return cat.charAt(0).toUpperCase() + cat.slice(1);
    }
    return cat;
  };

  return (
    <nav className={styles.filterNav} aria-label="Filter photos by phone model">
      <div className={styles.track} role="list">
        {categories.map((cat) => (
          <div key={cat} role="listitem">
            <button
              type="button"
              className={`${styles.pill} ${active === cat ? styles.pillActive : ""}`}
              onClick={() => onChange(active === cat ? "all" : cat)}
              aria-pressed={active === cat}
              aria-label={`Filter: ${getLabel(cat)}`}
              id={`filter-pill-${cat.replace(/\s+/g, "-").toLowerCase()}`}
            >
              <span>{getLabel(cat)}</span>
              <span className={styles.count}>{counts[cat] ?? 0}</span>
            </button>
          </div>
        ))}
      </div>
    </nav>
  );
}
