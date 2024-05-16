import Image from "next/image";
import styles from "./page.module.scss";
import { Permanent_Marker } from "next/font/google";
import { client, urlFor } from "./lib/sanity";
import { landingPage } from "./lib/interface";
import Link from "next/link";
import { PortableText } from "next-sanity";
import LandingHero from "./components/LandingHero";
import BeerOverview from "./components/BeerOverview";
import EventOverview from "./components/EventOverview";
import MerchOverview from "./components/MerchOverview";

export const revalidate = 300;
export const dynamic = "force-dynamic";

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
      <EventOverview
        title={data.eventTitle}
        ingress={data.eventIngress}
        text={data.eventDesc}
      />
      <MerchOverview
        title={data.merchTitle}
        ingress={data.merchIngress}
        text={data.merchDesc}
      />
    </main>
  );
}
