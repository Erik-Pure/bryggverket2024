"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { useMemo, useState, useTransition } from "react";
import {
  type BeverageCategory,
  type BeverageSegment,
  getCategory,
  getSegment,
  listPresentCategories,
  listPresentSegments,
} from "@/app/lib/beer";
import type { beverageThumb } from "@/app/lib/interface";
import BeverageTile from "./BeverageTile";
import styles from "./beverages.module.scss";

type CategoryFilter = "all" | BeverageCategory;
type SegmentFilter = "all" | BeverageSegment;

function matchesSegment(
  drink: beverageThumb,
  segmentFilter: SegmentFilter,
): boolean {
  // Legacy is opt-in — hidden from "Alla", visible only when Legacy is selected.
  if (segmentFilter === "all") return drink.segment !== "legacy";
  return drink.segment === segmentFilter;
}

/**
 * Filterable catalog of every beverage. Filtering is client-side: the list
 * is small (~30) and already on the page, so a round-trip would only slow it.
 * Segment and category filters combine with AND. Legacy is opt-in.
 */
export default function BeveragesCatalog({
  drinks,
}: {
  drinks: beverageThumb[];
}) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("all");
  const [, startTransition] = useTransition();
  const reduced = useReducedMotion();

  const segmentCounts = useMemo(() => {
    const next: Record<string, number> = { all: 0 };
    for (const drink of drinks) {
      if (drink.segment !== "legacy") next.all += 1;
      if (!drink.segment) continue;
      next[drink.segment] = (next[drink.segment] ?? 0) + 1;
    }
    return next;
  }, [drinks]);

  // Categories are counted within the active segment pool so chip numbers
  // match what the grid will show under the current segment filter.
  const categoryPool = useMemo(
    () => drinks.filter((drink) => matchesSegment(drink, segmentFilter)),
    [drinks, segmentFilter],
  );

  const categoryCounts = useMemo(() => {
    const next: Record<string, number> = { all: categoryPool.length };
    for (const drink of categoryPool) {
      if (!drink.category) continue;
      next[drink.category] = (next[drink.category] ?? 0) + 1;
    }
    return next;
  }, [categoryPool]);

  // Only categories/segments that actually have at least one drink —
  // empty types never get a chip.
  const categories = useMemo(
    () =>
      listPresentCategories(categoryPool.map((drink) => drink.category)).filter(
        (id) => (categoryCounts[id] ?? 0) > 0,
      ),
    [categoryPool, categoryCounts],
  );

  const segments = useMemo(
    () =>
      listPresentSegments(drinks.map((drink) => drink.segment)).filter(
        (id) => (segmentCounts[id] ?? 0) > 0,
      ),
    [drinks, segmentCounts],
  );

  const visible = useMemo(
    () =>
      drinks.filter((drink) => {
        const matchCategory =
          categoryFilter === "all" || drink.category === categoryFilter;
        return matchCategory && matchesSegment(drink, segmentFilter);
      }),
    [drinks, categoryFilter, segmentFilter],
  );

  const selectCategory = (next: CategoryFilter) => {
    startTransition(() => setCategoryFilter(next));
  };

  const selectSegment = (next: SegmentFilter) => {
    startTransition(() => {
      setSegmentFilter(next);
      setCategoryFilter("all");
    });
  };

  const showCategoryFilters = categories.length > 1;
  // Show segment chips when there is more than one segment, or when Legacy
  // exists so visitors can opt in (Alla alone would hide everything Legacy).
  const showSegmentFilters = segments.length > 1 || segments.includes("legacy");

  return (
    <section className={styles.catalog} aria-label="Alla drycker">
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label="Filtrera drycker"
      >
        {showSegmentFilters ? (
          <div className={styles.filterRow}>
            <span className={styles.filterLabel} id="filter-segment-label">
              Segment
            </span>
            <fieldset
              className={styles.chipGroup}
              aria-labelledby="filter-segment-label"
            >
              <button
                type="button"
                className={`${styles.chip} ${segmentFilter === "all" ? styles.chipActive : ""}`}
                aria-pressed={segmentFilter === "all"}
                onClick={() => selectSegment("all")}
              >
                Alla
                <span className={styles.chipCount}>{segmentCounts.all}</span>
              </button>
              {segments.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.chip} ${segmentFilter === id ? styles.chipActive : ""}`}
                  aria-pressed={segmentFilter === id}
                  onClick={() => selectSegment(id)}
                >
                  {getSegment(id)}
                  <span className={styles.chipCount}>
                    {segmentCounts[id] ?? 0}
                  </span>
                </button>
              ))}
            </fieldset>
          </div>
        ) : null}

        {showCategoryFilters ? (
          <div className={styles.filterRow}>
            <span className={styles.filterLabel} id="filter-type-label">
              Typ
            </span>
            <fieldset
              className={styles.chipGroup}
              aria-labelledby="filter-type-label"
            >
              <button
                type="button"
                className={`${styles.chip} ${categoryFilter === "all" ? styles.chipActive : ""}`}
                aria-pressed={categoryFilter === "all"}
                onClick={() => selectCategory("all")}
              >
                Alla
                <span className={styles.chipCount}>{categoryCounts.all}</span>
              </button>
              {categories.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.chip} ${categoryFilter === id ? styles.chipActive : ""}`}
                  aria-pressed={categoryFilter === id}
                  onClick={() => selectCategory(id)}
                >
                  {getCategory(id)}
                  <span className={styles.chipCount}>
                    {categoryCounts[id] ?? 0}
                  </span>
                </button>
              ))}
            </fieldset>
          </div>
        ) : null}

        <p className={styles.status} aria-live="polite">
          {visible.length} {visible.length === 1 ? "dryck" : "drycker"}
        </p>
      </div>

      <LayoutGroup>
        <div className={styles.grid}>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.length === 0 ? (
              <motion.p
                key="empty"
                className={styles.empty}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
              >
                Inga drycker med den filtreringen just nu.
              </motion.p>
            ) : (
              visible.map((drink) => (
                <motion.div
                  key={drink.currentSlug}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <BeverageTile drink={drink} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </section>
  );
}
