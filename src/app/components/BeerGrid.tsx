import Link from "next/link";
import Image from "next/image";
import { beverageThumb } from "../lib/interface";
import { client, urlFor } from "../lib/sanity";
import { Permanent_Marker } from "next/font/google";

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

export const revalidate = 300;
export const dynamic = "force-dynamic";

async function getData() {
  const query = `*[_type == 'beverage'] | order(_createdAt desc) {
      title,
        labelImage,
        "currentSlug": slug.current,
        can,
        bgColor,
        backgroundImage,
    }`;

  const data = await client.fetch(query);

  return data;
}

export default async function BeerGrid() {
  const data: beverageThumb[] = await getData();
  return (
    <div className="grid beerGrid">
      {data.map((post, idx) => {
        return (
          <div className="col col-3" key={idx}>
            <Link
              className={`${post.can}`}
              href={`/beverages/${post.currentSlug}`}
              style={{ backgroundColor: `${post.bgColor}` }}
            >
              <div className="backdrop">
                {post.backgroundImage ? (
                  <Image
                    src={urlFor(post.backgroundImage).url()}
                    width={300}
                    height={300}
                    alt=""
                  />
                ) : (
                  <Image
                    className="shiftLeft"
                    src={urlFor(post.labelImage).url()}
                    width={300}
                    height={300}
                    alt=""
                  />
                )}
              </div>
              <div className="beerShowcaseContainer">
                <div className="beerShowcase">
                  <Image
                    className="beerLabel"
                    src={urlFor(post.labelImage).url()}
                    width={300}
                    height={115}
                    alt={"label"}
                  />
                  <Image
                    className="beerLabel two"
                    src={urlFor(post.labelImage).url()}
                    width={300}
                    height={115}
                    alt={"label"}
                  />
                  <div className="beerLabelShading"></div>
                  <Image
                    className="beerCan"
                    src={`/images/${post.can}can.png`}
                    width={160}
                    height={300}
                    alt={"beer"}
                  />
                </div>
              </div>
              <h5 className="specialIngress">{post.title}</h5>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
