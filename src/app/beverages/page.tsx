import Image from "next/image";
import { PortableText } from "next-sanity";
import { cache } from "react";
import BeveragesCatalog from "@/app/components/beverages/BeveragesCatalog";
import styles from "@/app/components/beverages/beverages.module.scss";
import type { beveragesPage, beverageThumb } from "@/app/lib/interface";
import { client, urlFor } from "@/app/lib/sanity";

export const revalidate = 300;

interface PageData {
  page: beveragesPage | null;
  drinks: beverageThumb[];
}

const getData = cache(async (): Promise<PageData> => {
  const query = `{
    "page": *[_type == 'beverages'][0] {
      title,
      ingress,
      heroImage,
      description
    },
    "drinks": *[_type == 'beverage' && defined(slug.current)] | order(title asc) {
      title,
      labelImage,
      "currentSlug": slug.current,
      can,
      category,
      segment,
      style,
      percentage,
      bgColor,
      "labelMeta": labelImage.asset->metadata {
        "aspectRatio": dimensions.aspectRatio,
        lqip,
        palette { vibrant { background }, dominant { background } }
      }
    }
  }`;

  return client.fetch(query);
});

export default async function BeveragesPage() {
  const { page, drinks } = await getData();
  if (!page) return null;

  return (
    <article className={styles.page}>
      <section className={styles.hero}>
        {page.heroImage ? (
          <Image
            className={styles.heroImage}
            src={urlFor(page.heroImage).width(2400).url()}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        ) : null}
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <h1 className={styles.brand}>{page.title}</h1>
          {page.ingress ? <p className={styles.lead}>{page.ingress}</p> : null}
        </div>
      </section>

      <BeveragesCatalog drinks={drinks} />

      {page.description ? (
        <section className={styles.collab}>
          <div className={styles.collabInner}>
            <span className={styles.collabKicker}>Samarbeten</span>
            <div className={styles.collabBody}>
              <PortableText value={page.description} />
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
