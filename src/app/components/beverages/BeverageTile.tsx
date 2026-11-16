"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { buildTheme, formatAbv, getCan, getCategory } from "@/app/lib/beer";
import type { beverageThumb } from "@/app/lib/interface";
import { urlFor } from "@/app/lib/sanity";
import styles from "./beverages.module.scss";

function resolveLabelUrl(
  labelImage: beverageThumb["labelImage"],
): string | null {
  if (!labelImage) return null;
  if (typeof labelImage === "string") return labelImage;
  return urlFor(labelImage).width(900).url();
}

/**
 * One drink in the catalog. Uses the flat vessel with a CSS-wrapped label —
 * the same fake-3D treatment as before — so a full grid stays cheap to paint.
 * The real three.js vessel lives on the beverage page.
 */
export default function BeverageTile({ drink }: { drink: beverageThumb }) {
  const can = getCan(drink.can);
  const theme = buildTheme(drink.bgColor, drink.labelMeta?.palette, can.color);
  const category = getCategory(drink.category);
  const style = drink.style?.trim() || null;
  const abv = drink.percentage;
  const meta = [
    style ?? category,
    abv != null ? `${formatAbv(abv)} %` : null,
    can.volume,
  ]
    .filter(Boolean)
    .join(" · ");

  const labelUrl = resolveLabelUrl(drink.labelImage);
  const isBottle = drink.can === "bottle";
  const vesselSrc = isBottle
    ? "/images/emptybottle.png"
    : `/images/${drink.can ?? "black"}can.png`;

  return (
    <Link
      href={`/beverages/${drink.currentSlug}`}
      className={styles.tile}
      style={
        {
          "--tile-bg": theme.bg,
          "--tile-ink": theme.ink,
        } as CSSProperties
      }
    >
      <span className={styles.glow} aria-hidden="true" />
      <div className={styles.stage}>
        <div
          className={`${styles.can} ${isBottle ? styles.bottle : ""} ${
            drink.can === "sleek" ? styles.sleek : ""
          }`}
        >
          <div
            className={`beerShowcase ${isBottle ? "beerShowcaseBottle" : ""}`}
          >
            {isBottle ? (
              <div className="beerLabelClip">
                {labelUrl ? (
                  <>
                    <img
                      className="beerLabel"
                      src={labelUrl}
                      alt=""
                      style={{ left: "-115%" }}
                    />
                    <img className="beerLabel two" src={labelUrl} alt="" />
                  </>
                ) : null}
                <div className="beerLabelShading" />
              </div>
            ) : (
              <>
                {labelUrl ? (
                  <>
                    <img
                      className="beerLabel"
                      src={labelUrl}
                      alt=""
                      style={{ left: "-115%" }}
                    />
                    <img className="beerLabel two" src={labelUrl} alt="" />
                  </>
                ) : null}
                <div className="beerLabelShading" />
              </>
            )}
            <Image
              className="beerCan"
              src={vesselSrc}
              width={isBottle ? 200 : 160}
              height={isBottle ? 450 : 300}
              alt=""
            />
          </div>
        </div>
      </div>
      <div className={styles.copy}>
        <p className={styles.meta}>{meta}</p>
        <h2 className={styles.title}>{drink.title}</h2>
      </div>
    </Link>
  );
}
