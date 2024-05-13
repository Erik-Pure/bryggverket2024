import Link from "next/link";
import { beverageThumb } from "../lib/interface";
import { client, urlFor } from "../lib/sanity";
import Image from "next/image";
import { Permanent_Marker } from "next/font/google";

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

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
export default async function () {
  const data: beverageThumb[] = await getData();
  return (
    <article>
      <div className="hero">
        <div className="container">
          <h1>Våra drycker</h1>
          <h3 className={`specialIngress ${permMarker.className}`}>
            Städat eller stökigt?
            <br />
            Vi har dryck för varje tillfälle.
          </h3>
        </div>
      </div>

      <div className="block">
        <div className="container beers">
          <div className="grid beerGrid">
            {data.map((post) => (
              <div className="col col-3">
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
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
