import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import type { CSSProperties } from "react";
import { cache } from "react";
import BeerStage from "@/app/components/beer/BeerStage";
import styles from "@/app/components/beer/beer.module.scss";
import CountUp from "@/app/components/beer/CountUp";
import LabelChapter from "@/app/components/beer/LabelChapter";
import Reveal from "@/app/components/beer/Reveal";
import {
  buildTheme,
  formatAbv,
  getCan,
  getCategory,
  hasText,
  toPlainText,
} from "@/app/lib/beer";
import { permMarker, saira } from "@/app/lib/fonts";
import type { beverage, beverageLink } from "@/app/lib/interface";
import { client, urlFor } from "@/app/lib/sanity";

export const revalidate = 300;

/** Where the front of the label sits in the flat artwork (0-1), unless the
 * CMS says otherwise. */
const DEFAULT_LABEL_FRONT = 0.6;
/** ABV at which the strength meter is full. */
const METER_MAX = 12;

interface PageData {
  beverage: beverage | null;
  siblings: beverageLink[];
}

const getData = cache(async (slug: string): Promise<PageData> => {
  const query = `{
    "beverage": *[_type == 'beverage' && slug.current == $slug][0] {
      "currentSlug": slug.current,
      title,
      labelImage,
      labelFront,
      "labelMeta": labelImage.asset->metadata {
        "aspectRatio": dimensions.aspectRatio,
        lqip,
        palette { vibrant { background }, dominant { background } }
      },
      description,
      can,
      percentage,
      style,
      category,
      link,
      bgColor,
      backgroundImage,
      "backgroundMeta": backgroundImage.asset->metadata {
        "aspectRatio": dimensions.aspectRatio,
        lqip
      },
      ingredients,
    },
    "siblings": *[_type == 'beverage' && defined(slug.current)] | order(title asc) {
      title,
      "currentSlug": slug.current,
      can,
      bgColor,
      "palette": labelImage.asset->metadata.palette {
        vibrant { background },
        dominant { background }
      }
    }
  }`;

  return client.fetch(query, { slug });
});

/** Aspect ratio of the label as it will be delivered, honouring CMS crops. */
function getLabelAspect(data: beverage): number | null {
  const aspect = data.labelMeta?.aspectRatio;
  if (!aspect) return null;
  const crop = data.labelImage?.crop;
  if (!crop) return aspect;
  const width = 1 - (crop.left ?? 0) - (crop.right ?? 0);
  const height = 1 - (crop.top ?? 0) - (crop.bottom ?? 0);
  return width > 0 && height > 0 ? (aspect * width) / height : aspect;
}

/**
 * WebGL needs a same-origin (or CORS-enabled) image, and the Sanity CDN only
 * answers cross-origin requests from allow-listed hosts. Routing the texture
 * through the Next.js image optimizer keeps it same-origin on any domain.
 */
function getLabelTextureUrl(data: beverage, aspect: number): string {
  const width = 1024;
  const { props } = getImageProps({
    src: urlFor(data.labelImage).width(2048).url(),
    width,
    height: Math.round(width / aspect),
    alt: "",
  });
  // For a fixed width Next.js returns the 2x candidate as `src`.
  return props.src;
}

/** Roughly how many characters wide the title's widest line will be. */
function getTitleMeasure(title: string): number {
  const words = title.split(/\s+/).filter(Boolean);
  const longest = Math.max(...words.map((word) => word.length), 0);
  return Math.max(longest, Math.ceil(title.length / 2.1), 6);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { beverage: data } = await getData(slug);
  if (!data) return {};

  const can = getCan(data.can);
  const facts = [
    data.style ?? getCategory(data.category),
    data.percentage != null ? `${formatAbv(data.percentage)} %` : null,
    can.volume,
  ].filter(Boolean);
  const description =
    toPlainText(data.description).slice(0, 200) ||
    `${data.title} från Bryggverket. ${facts.join(", ")}.`;

  return {
    title: `${data.title} | Bryggverket`,
    description,
    openGraph: {
      title: `${data.title} | Bryggverket`,
      description,
      images: data.labelImage
        ? [urlFor(data.labelImage).width(1200).url()]
        : undefined,
    },
  };
}

function Kicker({ index, children }: { index: number; children: string }) {
  return (
    <p className={styles.kicker}>
      <span className={styles.kickerIndex}>
        {String(index).padStart(2, "0")}
      </span>
      <span className={styles.kickerRule} />
      {children}
    </p>
  );
}

export default async function BeveragePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { beverage: data, siblings } = await getData(slug);
  if (!data) notFound();

  const can = getCan(data.can);
  const theme = buildTheme(data.bgColor, data.labelMeta?.palette, can.color);
  const category = getCategory(data.category);
  const style = data.style?.trim() || null;
  const abv = data.percentage ?? null;
  const hasStory = hasText(data.description);
  const hasIngredients = hasText(data.ingredients);
  const ingredientsLength = toPlainText(data.ingredients).length;

  const labelAspect = data.labelImage ? getLabelAspect(data) : null;
  const labelUrl = labelAspect ? getLabelTextureUrl(data, labelAspect) : null;

  const index = siblings.findIndex((item) => item.currentSlug === slug);
  const next =
    siblings.length > 1 ? siblings[(index + 1) % siblings.length] : null;
  const nextTheme = next
    ? buildTheme(next.bgColor, next.palette, getCan(next.can).color)
    : null;

  const labelFront =
    typeof data.labelFront === "number"
      ? Math.min(100, Math.max(0, data.labelFront)) / 100
      : DEFAULT_LABEL_FRONT;

  // Chapters are numbered in the order they appear for this beverage.
  const chapters = [
    hasStory && "story",
    "facts",
    "label",
    hasIngredients && "ingredients",
    "summary",
  ].filter(Boolean);
  const numberOf = (id: string) => chapters.indexOf(id) + 1;
  const themeVars = {
    "--beer-bg": theme.bg,
    "--beer-ink": theme.ink,
    "--beer-ink-soft": theme.inkSoft,
    "--beer-ink-faint": theme.inkFaint,
    "--beer-line": theme.line,
    "--card-bg": theme.cardBg,
    "--card-ink": theme.cardInk,
    "--card-ink-soft": theme.cardInkSoft,
    "--card-line": theme.cardLine,
    "--title-measure": getTitleMeasure(data.title),
  } as CSSProperties;

  const tagClass = `${styles.tag} ${theme.isDark ? styles.tagInverted : ""} ${permMarker.className}`;

  return (
    <article className={styles.beer} style={themeVars}>
      <div className={styles.track} data-beer-track>
        <BeerStage
          canType={data.can ?? "black"}
          canSize={can.size}
          canColor={can.color}
          labelUrl={labelUrl}
          labelAspect={labelAspect}
          labelFront={labelFront}
          bg={theme.bg}
          glow={theme.glow}
          ink={theme.ink}
          isDark={theme.isDark}
          fontFamily={saira.style.fontFamily}
        />

        <div className={styles.chapters}>
          <section className={styles.hero} data-chapter="hero">
            <div className={styles.heroInner}>
              <Link href="/beverages" className={styles.back}>
                <span aria-hidden="true">←</span> Alla drycker
              </Link>
              <div className={styles.heroText} data-hero-copy>
                <p className={tagClass}>{style ?? category}</p>
                <h1 className={styles.title}>{data.title}</h1>
                <ul className={styles.heroMeta}>
                  <li>{category}</li>
                  {abv != null ? <li>{formatAbv(abv)} % vol</li> : null}
                  <li>{can.volume}</li>
                </ul>
              </div>
              <div className={styles.scrollCue} aria-hidden="true">
                <Image
                  src="/images/spinner-can.svg"
                  width={100}
                  height={100}
                  alt=""
                />
              </div>
            </div>
          </section>

          {hasStory ? (
            <section className={styles.chapter} data-chapter="story">
              <div className={styles.inner}>
                <div className={`${styles.column} ${styles.columnStart}`}>
                  <Reveal>
                    <Kicker index={numberOf("story")}>Berättelsen</Kicker>
                  </Reveal>
                  <Reveal delay={0.06} className={styles.prose}>
                    <PortableText value={data.description} />
                  </Reveal>
                  {data.backgroundImage ? (
                    <Reveal delay={0.1}>
                      <figure className={styles.poster}>
                        <Image
                          src={urlFor(data.backgroundImage).width(1400).url()}
                          width={1400}
                          height={Math.round(
                            1400 / (data.backgroundMeta?.aspectRatio ?? 1.5),
                          )}
                          sizes="(max-width: 900px) 100vw, 640px"
                          placeholder={
                            data.backgroundMeta?.lqip ? "blur" : "empty"
                          }
                          blurDataURL={data.backgroundMeta?.lqip}
                          alt={`Bild till ${data.title}`}
                        />
                      </figure>
                    </Reveal>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          <section className={styles.chapter} data-chapter="facts">
            <div className={styles.inner}>
              <div className={`${styles.column} ${styles.columnEnd}`}>
                <Reveal>
                  <Kicker index={numberOf("facts")}>Siffrorna</Kicker>
                </Reveal>
                <Reveal delay={0.06}>
                  {abv != null ? (
                    <div className={styles.figure}>
                      <p className={styles.figureValue}>
                        <CountUp
                          value={abv}
                          decimals={Number.isInteger(abv) ? 0 : 1}
                        />
                        <span className={styles.figureUnit}>%</span>
                      </p>
                      <p className={styles.figureLabel}>Alkoholhalt, volym</p>
                      <div
                        className={styles.meter}
                        style={
                          {
                            "--meter": Math.min(1, abv / METER_MAX),
                          } as CSSProperties
                        }
                        aria-hidden="true"
                      >
                        <span />
                      </div>
                    </div>
                  ) : (
                    <div className={styles.figure}>
                      <p className={styles.figureValue}>
                        {can.volume.replace(/\D+/g, "")}
                        <span className={styles.figureUnit}>cl</span>
                      </p>
                      <p className={styles.figureLabel}>Volym per burk</p>
                    </div>
                  )}
                </Reveal>
                <Reveal delay={0.12}>
                  <dl className={styles.facts}>
                    <div>
                      <dt>Typ</dt>
                      <dd>{category}</dd>
                    </div>
                    {style ? (
                      <div>
                        <dt>Stil</dt>
                        <dd>{style}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt>{abv != null ? "Storlek" : "Burk"}</dt>
                      <dd>{abv != null ? can.volume : can.description}</dd>
                    </div>
                  </dl>
                </Reveal>
              </div>
            </div>
          </section>

          <LabelChapter title={data.title}>
            <Kicker index={numberOf("label")}>Etiketten</Kicker>
            <p className={styles.labelLead}>Ett helt varv.</p>
            <p className={styles.labelHint}>
              Fortsätt scrolla så snurrar burken hela vägen runt.
            </p>
          </LabelChapter>

          {hasIngredients ? (
            <section className={styles.chapter} data-chapter="ingredients">
              <div className={styles.inner}>
                <div className={`${styles.column} ${styles.columnStart}`}>
                  <Reveal>
                    <Kicker index={numberOf("ingredients")}>Innehåll</Kicker>
                  </Reveal>
                  <Reveal
                    delay={0.06}
                    className={`${styles.ingredients} ${
                      ingredientsLength > 90 ? styles.ingredientsLong : ""
                    }`}
                  >
                    <PortableText value={data.ingredients} />
                  </Reveal>
                </div>
              </div>
            </section>
          ) : null}

          <section
            className={`${styles.chapter} ${styles.summary}`}
            data-chapter="summary"
          >
            <div className={styles.inner}>
              <Reveal className={styles.card}>
                <div className={styles.cardKicker}>
                  <Kicker index={numberOf("summary")}>I korthet</Kicker>
                </div>
                <h2 className={styles.cardTitle}>{data.title}</h2>
                <dl className={styles.specs}>
                  <div>
                    <dt>Typ</dt>
                    <dd>{category}</dd>
                  </div>
                  {style ? (
                    <div>
                      <dt>Stil</dt>
                      <dd>{style}</dd>
                    </div>
                  ) : null}
                  {abv != null ? (
                    <div>
                      <dt>Alkoholhalt</dt>
                      <dd>{formatAbv(abv)} %</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Storlek</dt>
                    <dd>{can.volume}</dd>
                  </div>
                  <div>
                    <dt>Burk</dt>
                    <dd>{can.description}</dd>
                  </div>
                  {hasIngredients ? (
                    <div className={styles.specsWide}>
                      <dt>Innehåll</dt>
                      <dd>{toPlainText(data.ingredients)}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className={styles.actions}>
                  {data.link ? (
                    <a
                      className={styles.cta}
                      href={data.link}
                      target="_blank"
                      rel="noopener"
                    >
                      Köp på Systembolaget
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                  <Link className={styles.ctaGhost} href="/beverages">
                    Alla drycker
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>
        </div>
      </div>

      {next && nextTheme ? (
        <Link
          className={styles.next}
          href={`/beverages/${next.currentSlug}`}
          style={
            {
              "--next-bg": nextTheme.bg,
              "--next-ink": nextTheme.ink,
            } as CSSProperties
          }
        >
          <span className={styles.nextKicker}>Nästa dryck</span>
          <span className={styles.nextTitle}>
            {next.title}
            <span className={styles.nextArrow} aria-hidden="true">
              →
            </span>
          </span>
        </Link>
      ) : null}
    </article>
  );
}
