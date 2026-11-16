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
  getCategory,
  listPresentCategories,
} from "@/app/lib/beer";
import type { beverageThumb } from "@/app/lib/interface";
import BeverageTile from "./BeverageTile";
import styles from "./beverages.module.scss";

type Filter = "all" | BeverageCategory;

/**
 * Filterable catalog of every beverage. Filtering is client-side: the list
 * is small (~30) and already on the page, so a round-trip would only slow it.
 */
export default function BeveragesCatalog({
  drinks,
}: {
  drinks: beverageThumb[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [, startTransition] = useTransition();
  const reduced = useReducedMotion();

  const categories = useMemo(
    () => listPresentCategories(drinks.map((drink) => drink.category)),
    [drinks],
  );

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: drinks.length };
    for (const drink of drinks) {
      if (!drink.category) continue;
      next[drink.category] = (next[drink.category] ?? 0) + 1;
    }
    return next;
  }, [drinks]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? drinks
        : drinks.filter((drink) => drink.category === filter),
    [drinks, filter],
  );

  const select = (next: Filter) => {
    startTransition(() => setFilter(next));
  };

  return (
    <section className={styles.catalog} aria-label="Alla drycker">
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label="Filtrera drycker"
      >
        <button
          type="button"
          className={`${styles.chip} ${filter === "all" ? styles.chipActive : ""}`}
          aria-pressed={filter === "all"}
          onClick={() => select("all")}
        >
          Alla
          <span className={styles.chipCount}>{counts.all}</span>
        </button>
        {categories.map((id) => (
          <button
            key={id}
            type="button"
            className={`${styles.chip} ${filter === id ? styles.chipActive : ""}`}
            aria-pressed={filter === id}
            onClick={() => select(id)}
          >
            {getCategory(id)}
            <span className={styles.chipCount}>{counts[id] ?? 0}</span>
          </button>
        ))}
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
                Inga drycker i den kategorin just nu.
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
