import Image from "next/image";
import styles from "./page.module.scss";
import { Permanent_Marker } from "next/font/google";
import { client, urlFor } from "./lib/sanity";
import { landingPage } from "./lib/interface";
import Link from "next/link";
import { PortableText } from "next-sanity";
import SplineViewer from "./components/SplineViewer";
import LandingHero from "./components/LandingHero";

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

      <section className="beersOverview darkSection">
        <div className="container marginLarge">
          <div className="grid centerAlign">
            <div className="col col-6">
              <h2>{data.drinkTitle}</h2>
              <div className="border"></div>
              <h4 className={permMarker.className}>{data.drinkIngress}</h4>
              <PortableText value={data.drinkDesc} />

              <Link href="/beverages" className="btn">
                Alla våra drycker
              </Link>
            </div>

            <div className="beersSpline">
              <SplineViewer
                url={
                  "https://prod.spline.design/aH8bAg6y1DrUFA48/scene.splinecode"
                }
              />
            </div>
          </div>
        </div>
      </section>
      <section className="eventsOverview">
        <div className="container marginLarge">
          <div className="grid">
            <div className="col col-6">
              <h2>{data.eventTitle}</h2>
              <div className="border"></div>
              <h4 className={permMarker.className}>{data.eventIngress}</h4>
              <PortableText value={data.eventDesc} />
              <Link href="/book" className="btn black">
                Ja! Jag vill ha kul
              </Link>
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
            alt={"beer"}
          />
        </div>
      </section>
    </main>
  );
}
