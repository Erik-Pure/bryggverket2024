"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

function format(value: number, decimals: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Counts up to `value` the first time it scrolls into view. */
export default function CountUp({
  value,
  decimals,
}: {
  value: number;
  decimals: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || !inView || reduced) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (current) => {
        element.textContent = format(current, decimals);
      },
    });
    return () => controls.stop();
  }, [inView, reduced, value, decimals]);

  // The final value is rendered on the server so it is there without JS.
  return <span ref={ref}>{format(value, decimals)}</span>;
}
