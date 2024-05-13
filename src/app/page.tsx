import Image from "next/image";
import styles from "./page.module.scss";
import { Permanent_Marker } from "next/font/google";
import { client, urlFor } from "./lib/sanity";
import { beverageThumb } from "./lib/interface";
import Link from "next/link";
import BeerThumb from "./components/BeerThumb";

async function getData() {
  const query = `*[_type == 'beverage'] | order(_createdAt desc) {
    title,
      labelImage,
      "currentSlug": slug.current,
      can,
      bgColor,
      backgroundImage
  }[0..3]`;

  const data = await client.fetch(query);

  return data;
}

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

export default async function Home() {
  const data: beverageThumb[] = await getData();

  return (
    <main className={styles.main}>
      <div className="landingHero videoBg textCenter">
        <video
          className="bgVideo"
          autoPlay
          muted
          loop
          aria-label="Video player"
        >
          <source src="/videos/bv-intro.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="container">
          <h1>Bryggverket</h1>
          <h2 className={`specialIngress ${permMarker.className}`}>
            How can less be more?
          </h2>
        </div>
      </div>
      <section className="aboutOverview darkSection">
        <div className="container marginLarge superSmall textCenter">
          <h2>HUR KAN MINDRE VARA MER?</h2>
          <div className="border"></div>
          <h4 className={`specialIngress ${permMarker.className}`}>
            Boysen bakom bärsen
          </h4>
          <p>
            Ett litet bryggeri startat av fyra killar som gillar öl. Förmodligen
            gillar de öl lite mer än de flesta eftersom de flesta inte startar
            ett litet bryggeri.
          </p>
          <Link href="/about" className="btn">
            Läs mer om oss
          </Link>
        </div>
      </section>

      <section className="beersOverview darkSection">
        <div className="container marginLarge">
          <div className="grid centerAlign">
            <div className="col col-6">
              <h2>Våra öl & drycker</h2>
              <div className="border"></div>
              <h4 className={permMarker.className}>
                Städat eller stökigt? <br />
                Vi har dryck för varje tillfälle.
              </h4>
              <p>
                Vi har allt från starköl, alkoholhaltiga blanddrycker, läsk hela
                vägen till naturellt kolsyrat vatten. Vi täcker dig kompis!
              </p>

              <Link href="/beverages" className="btn">
                Alla våra drycker
              </Link>
            </div>
            <div className="col col-6">
              <div className="grid beerGrid">
                {data.map((post) => (
                  <div className="col col-6">
                    <BeerThumb
                      currentSlug={post.currentSlug}
                      bgColor={post.bgColor}
                      backgroundImage={post.backgroundImage}
                      labelImage={post.labelImage}
                      can={post.can}
                      title={post.title}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="eventsOverview">
        <div className="container marginLarge">
          <div className="grid">
            <div className="col col-6">
              <h2>Event & Bokningar</h2>
              <div className="border"></div>
              <h4 className={permMarker.className}>
                Ölprovningar eller evenemang?
                <br />
                Kom till oss eller så kommer vi till dig
              </h4>
              <p>
                Ta med dina vänner eller kollegor och ha lite latjolajbans med
                Bryggverket.
              </p>
              <Link href="/book" className="btn black">
                Ja! Jag vill ha kul
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="merchOverview">
        <div className="container textCenter marginLarge">
          <h2>MERCH</h2>
          <h3 className={permMarker.className}>
            Ni hittar allt vårt merch på brewmerch
          </h3>
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
