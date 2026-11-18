import LandingExperience from "./components/landing/LandingExperience";
import type { FeaturedCan } from "./components/landing/stage/LandingScene";
import type { landingPage } from "./lib/interface";
import { client } from "./lib/sanity";

export const revalidate = 300;

/** Anonymous black cans — the landing never fronts a specific drink. */
const BLACK_CAN: FeaturedCan = {
  canSize: "33",
  canColor: "black",
  labelUrl: null,
  labelAspect: null,
  labelFront: 0,
};

const CANS: [FeaturedCan, FeaturedCan, FeaturedCan] = [
  BLACK_CAN,
  BLACK_CAN,
  BLACK_CAN,
];

/** Soft studio glow that suits bare black aluminium. */
const STAGE_GLOW = "#9a93a8";

async function getData(): Promise<landingPage> {
  const query = `*[_type == 'landing'][0] {
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
  }`;

  return client.fetch(query);
}

export default async function Home() {
  const landing = await getData();

  // Avoid <main>/<article> — globals set overflow:hidden on both, which
  // prevents the sticky Remotion stage from pinning while scrolling.
  return (
    <LandingExperience content={landing} featured={CANS} glow={STAGE_GLOW} />
  );
}
