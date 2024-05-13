import { Permanent_Marker } from "next/font/google";
import BeerGrid from "../components/BeerGrid";
import { client, urlFor } from "../lib/sanity";
import { beveragesPage } from "../lib/interface";
import Image from "next/image";
import { PortableText } from "next-sanity";

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

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

export default async function () {
  const data: beveragesPage = await getData();
  return (
    <article className="singlePage">
      <div className="hero">
        {data.heroImage ? (
          <Image
            className="heroBgImage"
            src={urlFor(data.heroImage).url()}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            alt=""
            objectFit="cover"
          />
        ) : (
          <video
            className="bgVideo"
            autoPlay
            muted
            loop
            aria-label="Video player"
          >
            <source src="/videos/burk-to-render.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

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

      <div className="container darkSection marginLarge">
        <div className="grid">
          <div className="col col-6">
            <PortableText value={data.description} />
          </div>
          <div className="col col-6"></div>
        </div>
      </div>
    </article>
  );
}
