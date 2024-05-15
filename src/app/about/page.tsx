import { Permanent_Marker } from "next/font/google";
import Image from "next/image";
import { client, urlFor } from "../lib/sanity";
import { aboutPage } from "../lib/interface";
import { PortableText } from "next-sanity";
import EmployeeGrid from "../components/EmployeeGrid";

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

export const revalidate = 300;
export const dynamic = "force-dynamic";

async function getData() {
  const query = `*[_type == 'about'] {
    title,
    ingress,
    heroImage,
    description,
  }[0]`;

  const data = await client.fetch(query);
  return data;
}

export default async function About() {
  const data: aboutPage = await getData();
  return (
    <div className="singlePage">
      <div className="hero">
        <Image
          className="heroBgImage"
          src={urlFor(data.heroImage).url()}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt=""
          objectFit="cover"
        />
        <div className="heroBgOverlay"></div>
        <div className="container">
          <h1>{data.title}</h1>
          <h3 className={`specialIngress ${permMarker.className}`}>
            {data.ingress}
          </h3>
        </div>
      </div>
      <div className="container marginMedium">
        <EmployeeGrid />
      </div>
      <div className="container narrow marginMedium">
        <PortableText value={data.description} />
      </div>
    </div>
  );
}
