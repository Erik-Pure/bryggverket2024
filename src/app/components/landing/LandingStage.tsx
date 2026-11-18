"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import styles from "./landing.module.scss";
import type { LandingPlayerProps } from "./stage/LandingPlayer";

const LandingPlayer = dynamic(() => import("./stage/LandingPlayer"), {
  ssr: false,
});

type LandingStageProps = Omit<LandingPlayerProps, "onReady">;

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Sticky stage that carries the 3D cans through the landing chapters.
 * Without WebGL it stays empty — the copy still stands alone.
 */
export default function LandingStage(props: LandingStageProps) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setWebgl(supportsWebGL()), []);
  const handleReady = useCallback(() => setReady(true), []);

  if (webgl === false) return null;

  return (
    <div
      className={`${styles.stage} ${ready ? styles.stageReady : ""}`}
      aria-hidden="true"
    >
      {webgl ? <LandingPlayer {...props} onReady={handleReady} /> : null}
    </div>
  );
}
