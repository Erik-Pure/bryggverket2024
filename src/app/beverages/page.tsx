import Image from "next/image";
import { PortableText } from "next-sanity";
import BeerGrid from "../components/BeerGrid";
import { permMarker } from "../lib/fonts";
import type { beveragesPage } from "../lib/interface";
import { client, urlFor } from "../lib/sanity";

export const revalidate = 300;

async function getData() {
  const query = `*[_type == 'beverages'] {
    title,
    ingress,
    heroImage,
    description
  }[0]`;

  const data = await client.fetch(query);
  return data;
}

export default async function BeveragesPage() {
  const data: beveragesPage = await getData();
  return (
    <article className="singlePage">
      <div className="hero">
        <Image
          className="heroBgImage"
          src={urlFor(data.heroImage).url()}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt=""
          style={{ objectFit: "cover" }}
        />

        <div className="heroBgOverlay"></div>
        <div className="container">
          <h1>{data.title}</h1>
          <h3 className={`specialIngress ${permMarker.className}`}>
            {data.ingress}
          </h3>
        </div>
      </div>

      <div className="block">
        <div className="container beers">
          <BeerGrid />
        </div>
      </div>

      <div className="container narrow marginLarge textCenter">
        <PortableText value={data.description} />
      </div>
    </article>
  );
}
