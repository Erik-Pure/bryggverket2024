import Image from "next/image";
import Link from "next/link";
import type { beverageThumb } from "../lib/interface";
import { client, urlFor } from "../lib/sanity";

export const revalidate = 300;

async function getData() {
  const query = `*[_type == 'beverage'] | order(title asc) {
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
      {data.map((post) => {
        return (
          <div className="col col-3" key={post.currentSlug}>
            <Link
              className={post.can}
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
                  {/* eslint-disable-next-line @next/next/no-img-element -- animated label needs CSS-controlled sizing */}
                  <img
                    className="beerLabel"
                    src={urlFor(post.labelImage).url()}
                    alt=""
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="beerLabel two"
                    src={urlFor(post.labelImage).url()}
                    alt=""
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
