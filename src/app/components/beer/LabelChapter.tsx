"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { type ReactNode, useRef } from "react";
import styles from "./beer.module.scss";

const REPEATS = ["a", "b", "c", "d", "e"];

/**
 * A pinned turntable shot: the page holds still while the can makes one full
 * revolution and the beer's name slides past behind it.
 */
export default function LabelChapter({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // With reduced motion the name stays put at its starting offset.
  const x = useTransform(
    scrollYProgress,
    (progress) => `${6 - (reduced ? 0 : progress) * 62}%`,
  );

  return (
    <section ref={ref} className={styles.label} data-chapter="label">
      <div className={styles.labelPin}>
        <motion.div className={styles.marquee} style={{ x }} aria-hidden="true">
          {REPEATS.map((key) => (
            <span key={key}>{title}</span>
          ))}
        </motion.div>
        <div className={styles.labelCaption}>{children}</div>
      </div>
    </section>
  );
}
