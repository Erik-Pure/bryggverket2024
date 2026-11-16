"use client";

import BeverageTile from "@/app/components/beverages/BeverageTile";
import styles from "@/app/components/beverages/beverages.module.scss";
import type { beverageThumb } from "@/app/lib/interface";

const MOCK: beverageThumb = {
  title: "Sour Gin",
  currentSlug: "sour-gin",
  can: "bottle",
  category: "spirit",
  style: "Gin",
  percentage: 38,
  bgColor: "#8b6a4a",
  labelImage: "/images/dev-baverhojt-label.jpg",
  labelMeta: {
    aspectRatio: 0.8,
    palette: { vibrant: { background: "#8b6a4a" } },
  },
};

/**
 * Renders a catalog-style tile for the empty spirit bottle, with the
 * spinning label forced on so placement can be tuned without hover.
 */
export default function BeverageTilePreview() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 24px",
        background: "#1a1a1a",
      }}
    >
      <style>{`
        .devForceSpin .beerLabel {
          animation-play-state: running !important;
        }
      `}</style>
      <p style={{ color: "#aaa", marginBottom: 24, fontFamily: "sans-serif" }}>
        Bottle tile preview — label should sit on the body, below the shoulder.
      </p>
      <div
        className={`devForceSpin ${styles.grid}`}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 20,
          maxWidth: 900,
        }}
      >
        <BeverageTile drink={MOCK} />
        <BeverageTile
          drink={{
            ...MOCK,
            title: "Bäverhojt",
            bgColor: "#d9c4a0",
            style: "Spritdryck",
            percentage: 32,
            labelMeta: {
              aspectRatio: 0.8,
              palette: { vibrant: { background: "#d9c4a0" } },
            },
          }}
        />
      </div>
    </main>
  );
}
