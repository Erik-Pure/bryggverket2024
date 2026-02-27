import Image from "next/image";
import Link from "next/link";
import { urlFor } from "../lib/sanity";

export default function BeerThumb({
  currentSlug,
  bgColor,
  backgroundImage,
  labelImage,
  can,
  title,
}: {
  currentSlug: string;
  bgColor: string;
  backgroundImage: any;
  labelImage: any;
  can: string;
  title: string;
}) {
  return (
    <Link
      className={can}
      href={`/beverages/${currentSlug}`}
      style={{ backgroundColor: `${bgColor}` }}
    >
      <div className="backdrop">
        {backgroundImage ? (
          <Image
            src={urlFor(backgroundImage).url()}
            width={300}
            height={300}
            alt=""
          />
        ) : (
          <Image
            className="shiftLeft"
            src={urlFor(labelImage).url()}
            width={300}
            height={300}
            alt=""
          />
        )}
      </div>
      <div className="beerShowcaseContainer">
        <div className="beerShowcase">
          {/* eslint-disable-next-line @next/next/no-img-element -- animated label needs CSS-controlled sizing */}
          <img className="beerLabel" src={urlFor(labelImage).url()} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="beerLabel two"
            src={urlFor(labelImage).url()}
            alt=""
          />
          <div className="beerLabelShading"></div>
          <Image
            className="beerCan"
            src={`/images/${can}can.png`}
            width={160}
            height={300}
            alt={"beer"}
          />
        </div>
      </div>
      <h5 className="specialIngress">{title}</h5>
    </Link>
  );
}
