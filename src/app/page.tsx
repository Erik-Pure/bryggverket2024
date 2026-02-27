import BeerOverview from "./components/BeerOverview";
import EventOverview from "./components/EventOverview";
import LandingHero from "./components/LandingHero";
import MerchOverview from "./components/MerchOverview";
import type { landingPage } from "./lib/interface";
import { client } from "./lib/sanity";
import styles from "./page.module.scss";

export const revalidate = 300;

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
