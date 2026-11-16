"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import styles from "./beer.module.scss";
import type { StagePlayerProps } from "./stage/StagePlayer";

const StagePlayer = dynamic(() => import("./stage/StagePlayer"), {
  ssr: false,
});

type BeerStageProps = Omit<StagePlayerProps, "onReady"> & {
  /** Legacy can type, used for the flat fallback image. */
  canType: string;
};

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The sticky stage that carries the 3D can down the page. It is purely
 * decorative: all content lives in the chapters it floats over. Without
 * WebGL it falls back to the flat can used in the beverage grid.
 */
export default function BeerStage({ canType, ...scene }: BeerStageProps) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => setWebgl(supportsWebGL()), []);
  const handleReady = useCallback(() => setReady(true), []);

  const isBottle = canType === "bottle";
  const vesselSrc = isBottle
    ? "/images/emptybottle.png"
    : `/images/${canType}can.png`;

  if (webgl === false) {
    return (
      <div
        className={`${styles.stageFallback} ${isBottle ? styles.stageFallbackBottle : ""}`}
        aria-hidden="true"
      >
        <div className={`beerShowcase ${isBottle ? "beerShowcaseBottle" : ""}`}>
          {isBottle ? (
            <div className="beerLabelClip">
              {scene.labelUrl ? (
                <img
                  className="beerLabel"
                  src={scene.labelUrl}
                  alt=""
                  style={{ left: "-115%" }}
                />
              ) : null}
              <div className="beerLabelShading" />
            </div>
          ) : (
            <>
              {scene.labelUrl ? (
                <img
                  className="beerLabel"
                  src={scene.labelUrl}
                  alt=""
                  style={{ left: "-115%" }}
                />
              ) : null}
              <div className="beerLabelShading" />
            </>
          )}
          <img className="beerCan" src={vesselSrc} alt="" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.stage} ${ready ? styles.stageReady : ""}`}
      aria-hidden="true"
    >
      {webgl ? <StagePlayer {...scene} onReady={handleReady} /> : null}
    </div>
  );
}
