import { getImageProps } from "next/image";
import LandingExperience from "./components/landing/LandingExperience";
import type { FeaturedCan } from "./components/landing/stage/LandingScene";
import { buildTheme, getCan } from "./lib/beer";
import type { landingPage } from "./lib/interface";
import { client, urlFor } from "./lib/sanity";

export const revalidate = 300;

const DEFAULT_LABEL_FRONT = 0.6;

/** Prefer a vivid lineup across formats when the CMS has enough drinks. */
const FEATURED_SLUGS = [
  "cola-svartvinbaer",
  "cherry-the-rhubarbarian",
  "fizzy-bellini",
] as const;

interface FeaturedBeverage {
  title: string;
  slug: string;
  can: string;
  bgColor?: string;
  labelImage: unknown;
  labelFront?: number;
  labelMeta?: {
    aspectRatio?: number;
    palette?: {
      vibrant?: { background?: string };
      dominant?: { background?: string };
    };
  };
}

async function getData(): Promise<{
  landing: landingPage;
  featured: FeaturedBeverage[];
}> {
  const query = `{
    "landing": *[_type == 'landing'][0] {
      title,
      ingress,
      aboutTitle,
      aboutIngress,
      aboutDesc,
      drinkTitle,
      drinkIngress,
      drinkDesc,
      eventTitle,
      eventIngress,
      eventDesc,
      merchTitle,
      merchIngress,
      merchDesc,
    },
    "featured": *[_type == 'beverage' && defined(slug.current) && defined(labelImage) && slug.current in $slugs] {
      title,
      "slug": slug.current,
      can,
      bgColor,
      labelImage,
      labelFront,
      "labelMeta": labelImage.asset->metadata {
        "aspectRatio": dimensions.aspectRatio,
        palette { vibrant { background }, dominant { background } }
      }
    },
    "fallback": *[_type == 'beverage' && defined(slug.current) && defined(labelImage)] | order(title asc)[0...6] {
      title,
      "slug": slug.current,
      can,
      bgColor,
      labelImage,
      labelFront,
      "labelMeta": labelImage.asset->metadata {
        "aspectRatio": dimensions.aspectRatio,
        palette { vibrant { background }, dominant { background } }
      }
    }
  }`;

  const data = await client.fetch(query, { slugs: [...FEATURED_SLUGS] });
  const bySlug = new Map<string, FeaturedBeverage>(
    (data.featured as FeaturedBeverage[]).map((item) => [item.slug, item]),
  );
  const ordered = FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter(
    Boolean,
  ) as FeaturedBeverage[];
  const fallback = (data.fallback as FeaturedBeverage[]) ?? [];
  const picked = [...ordered];
  for (const item of fallback) {
    if (picked.length >= 3) break;
    if (!picked.some((existing) => existing.slug === item.slug)) {
      picked.push(item);
    }
  }

  return { landing: data.landing, featured: picked.slice(0, 3) };
}

function getLabelAspect(item: FeaturedBeverage): number | null {
  const aspect = item.labelMeta?.aspectRatio;
  if (!aspect) return null;
  const crop = (item.labelImage as { crop?: Record<string, number> } | null)
    ?.crop;
  if (!crop) return aspect;
  const width = 1 - (crop.left ?? 0) - (crop.right ?? 0);
  const height = 1 - (crop.top ?? 0) - (crop.bottom ?? 0);
  return width > 0 && height > 0 ? (aspect * width) / height : aspect;
}

function getLabelTextureUrl(item: FeaturedBeverage, aspect: number): string {
  const width = 1024;
  const { props } = getImageProps({
    src: urlFor(item.labelImage).width(2048).url(),
    width,
    height: Math.round(width / aspect),
    alt: "",
  });
  return props.src;
}

function toFeaturedCan(item: FeaturedBeverage | undefined): FeaturedCan {
  if (!item) {
    return {
      canSize: "33",
      canColor: "black",
      labelUrl: null,
      labelAspect: null,
      labelFront: DEFAULT_LABEL_FRONT,
    };
  }
  const can = getCan(item.can);
  const labelAspect = item.labelImage ? getLabelAspect(item) : null;
  const labelUrl = labelAspect ? getLabelTextureUrl(item, labelAspect) : null;
  const labelFront =
    typeof item.labelFront === "number"
      ? Math.min(100, Math.max(0, item.labelFront)) / 100
      : DEFAULT_LABEL_FRONT;

  return {
    canSize: can.size,
    canColor: can.color,
    labelUrl,
    labelAspect,
    labelFront,
  };
}

export default async function Home() {
  const { landing, featured } = await getData();
  const cans = [
    toFeaturedCan(featured[0]),
    toFeaturedCan(featured[1]),
    toFeaturedCan(featured[2]),
  ] as [FeaturedCan, FeaturedCan, FeaturedCan];

  const lead = featured[0];
  const leadCan = getCan(lead?.can);
  const theme = buildTheme(
    lead?.bgColor,
    lead?.labelMeta?.palette,
    leadCan.color,
  );

  return (
    <main>
      <LandingExperience content={landing} featured={cans} glow={theme.glow} />
    </main>
  );
}
