import {
  contrast,
  ensureContrast,
  luminance,
  mix,
  parseHex,
  rgba,
  toHex,
} from "./color";

export type CanSize = "33" | "44" | "25" | "bottle";
export type CanColor = "black" | "white" | "clear";

export interface CanConfig {
  size: CanSize;
  color: CanColor;
  volume: string;
  description: string;
}

/** Maps the CMS "Typ av burk" value to a physical can. */
export function getCan(canType: string | null | undefined): CanConfig {
  switch (canType) {
    case "white":
      return {
        size: "33",
        color: "white",
        volume: "33 cl",
        description: "Vit burk",
      };
    case "big":
      return {
        size: "44",
        color: "white",
        volume: "44 cl",
        description: "Långburk",
      };
    case "sleek":
      return {
        size: "25",
        color: "white",
        volume: "25 cl",
        description: "Sleek-burk",
      };
    case "bottle":
      return {
        size: "bottle",
        color: "clear",
        volume: "50 cl",
        description: "Glasflaska",
      };
    default:
      return {
        size: "33",
        color: "black",
        volume: "33 cl",
        description: "Svart burk",
      };
  }
}

/** CMS category values, in the order filters should appear. */
export const CATEGORY_ORDER = [
  "strong",
  "drink",
  "soda",
  "spirit",
  "weak",
  "noalco",
] as const;

export type BeverageCategory = (typeof CATEGORY_ORDER)[number];

export function getCategory(category: string | null | undefined): string {
  switch (category) {
    case "strong":
      return "Starköl";
    case "weak":
      return "Folköl";
    case "drink":
      return "Blanddryck";
    case "soda":
      return "Läsk";
    case "spirit":
      return "Sprit";
    case "noalco":
      return "Alkoholfri";
    default:
      return "Dryck";
  }
}

/**
 * Categories that actually appear in a list of beverages, in filter order.
 * Empty types (no drinks yet) are omitted — applies to every category,
 * including Sprit before any spirit has been published.
 */
export function listPresentCategories(
  categories: Array<string | null | undefined>,
): BeverageCategory[] {
  const present = new Set(
    categories.filter((value): value is string => Boolean(value)),
  );
  return CATEGORY_ORDER.filter((id) => present.has(id));
}

/** Formats ABV with a period, e.g. "7.5", matching the brand's label style. */
export function formatAbv(percentage: number): string {
  return Number.isInteger(percentage)
    ? String(percentage)
    : percentage.toFixed(1);
}

export interface BeerTheme {
  /** Page background, the beer's own colour. */
  bg: string;
  /** Text colour with guaranteed contrast against `bg`. */
  ink: string;
  inkSoft: string;
  inkFaint: string;
  line: string;
  /** Slightly shifted background used for depth behind the can. */
  glow: string;
  /** Inverted surface (summary card). */
  cardBg: string;
  cardInk: string;
  cardInkSoft: string;
  cardLine: string;
  isDark: boolean;
}

interface PaletteSwatch {
  background?: string;
}

export interface LabelPalette {
  vibrant?: PaletteSwatch;
  dominant?: PaletteSwatch;
  darkMuted?: PaletteSwatch;
}

const NEAR_BLACK = "#0d0d0e";
const WHITE = "#ffffff";

/**
 * Builds the colour world of a beer page. The editor's "Bakgrundsfärg" wins;
 * otherwise the colour is picked from the label artwork itself.
 */
export function buildTheme(
  bgColor: string | null | undefined,
  palette: LabelPalette | null | undefined,
  canColor: CanColor,
): BeerTheme {
  const base =
    parseHex(bgColor) ??
    parseHex(palette?.vibrant?.background) ??
    parseHex(palette?.dominant?.background) ??
    parseHex(canColor === "black" ? "#1c1c1f" : "#e8e5de"); // clear glass falls through to the light neutral
  const source = base ?? [28, 28, 31];

  const isDark = luminance(source) <= 0.3;
  const inkRgb = parseHex(isDark ? WHITE : NEAR_BLACK) as [
    number,
    number,
    number,
  ];
  const bgRgb = ensureContrast(source, inkRgb, 4.6);
  const glowRgb = mix(bgRgb, [255, 255, 255], isDark ? 0.16 : 0.42);

  const cardBgRgb = parseHex(isDark ? "#f6f4ef" : "#101011") as [
    number,
    number,
    number,
  ];
  const cardInkRgb = parseHex(isDark ? NEAR_BLACK : WHITE) as [
    number,
    number,
    number,
  ];

  // Keep a sanity check so a future palette tweak cannot silently break text.
  const ink =
    contrast(bgRgb, inkRgb) >= 4.5 ? toHex(inkRgb) : isDark ? WHITE : "#000000";

  return {
    bg: toHex(bgRgb),
    ink,
    inkSoft: rgba(inkRgb, isDark ? 0.82 : 0.78),
    inkFaint: rgba(inkRgb, isDark ? 0.6 : 0.56),
    line: rgba(inkRgb, 0.22),
    glow: toHex(glowRgb),
    cardBg: toHex(cardBgRgb),
    cardInk: toHex(cardInkRgb),
    cardInkSoft: rgba(cardInkRgb, 0.68),
    cardLine: rgba(cardInkRgb, 0.16),
    isDark,
  };
}

interface TextSpan {
  text?: string;
}

interface TextBlock {
  _type?: string;
  children?: TextSpan[];
}

/** Flattens Portable Text to plain text, e.g. for meta descriptions. */
export function toPlainText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  return (blocks as TextBlock[])
    .filter(
      (block) => block?._type === "block" && Array.isArray(block.children),
    )
    .map((block) =>
      (block.children as TextSpan[]).map((child) => child.text ?? "").join(""),
    )
    .map((text) => text.trim())
    .filter(Boolean)
    .join(" ");
}

export function hasText(blocks: unknown): boolean {
  return toPlainText(blocks).length > 0;
}
