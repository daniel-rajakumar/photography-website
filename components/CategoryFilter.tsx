"use client";

import styles from "./CategoryFilter.module.css";

interface CategoryFilterProps {
  active: string;
  onChange: (category: string) => void;
  categories: string[];
  counts: Record<string, number>;
}

export default function CategoryFilter({
  active,
  onChange,
  categories,
  counts,
}: CategoryFilterProps) {
  const getLabel = (cat: string) => {
    if (cat === "all") return "All Phones";
    return cat;
  };

  return (
    <nav className={styles.filterNav} aria-label="Filter photos by phone model">
      <div className={styles.track} role="list">
        {categories.map((cat) => (
          <button
            key={cat}
            role="listitem"
            className={`${styles.pill} ${active === cat ? styles.pillActive : ""}`}
            onClick={() => onChange(cat)}
            aria-pressed={active === cat}
            aria-label={`Filter: ${getLabel(cat)}`}
            id={`filter-pill-${cat.replace(/\s+/g, "-").toLowerCase()}`}
          >
            <span>{getLabel(cat)}</span>
            <span className={styles.count}>{counts[cat] ?? 0}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
