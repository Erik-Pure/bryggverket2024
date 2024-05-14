import Image from "next/image";
import styles from "./page.module.scss";
import { Permanent_Marker } from "next/font/google";
import { client, urlFor } from "./lib/sanity";
import { landingPage } from "./lib/interface";
import Link from "next/link";
import { PortableText } from "next-sanity";
import LandingHero from "./components/LandingHero";
import BeerOverview from "./components/BeerOverview";

async function getData() {
  const query = `*[_type == 'landing'] {
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
  }[0]`;

  const data = await client.fetch(query);

  return data;
}

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

export default async function Home() {
  const data: landingPage = await getData();

  return (
    <main className={styles.main}>
      <LandingHero
        title={data.title}
        ingress={data.ingress}
        aboutTitle={data.aboutTitle}
        aboutIngress={data.aboutIngress}
        aboutDesc={data.aboutDesc}
      />
      <BeerOverview
        title={data.drinkTitle}
        ingress={data.drinkIngress}
        text={data.drinkDesc}
      />
      <section className="eventsOverview darkSection">
        <div className="container marginLarge">
          <div className="grid centerAlign">
            <div className="col col-6">
              <h2>{data.eventTitle}</h2>
              <div className="border"></div>
              <h4 className={permMarker.className}>{data.eventIngress}</h4>
              <PortableText value={data.eventDesc} />
              <Link href="/book" className="btn">
                Ja! Jag vill ha kul
              </Link>
            </div>
            <div className="col col-6">
              <Image
                src="/images/event.webp"
                width={640}
                height={640}
                alt={""}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="merchOverview">
        <div className="container textCenter marginLarge">
          <h2>{data.merchTitle}</h2>
          <h4 className={permMarker.className}>{data.merchIngress}</h4>
          <PortableText value={data.merchDesc} />
          <a
            className="btn black"
            href="https://brewmerch.se/collections/bryggverket"
            target="_blank"
          >
            Brewmerch
          </a>
          <Image
            className="beerCan"
            src="/images/merch.webp"
            width={1024}
            height={500}
            alt={""}
          />
        </div>
      </section>
    </main>
  );
}
