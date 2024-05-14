import BeerHero from "@/app/components/BeerHero";
import { beverage } from "@/app/lib/interface";
import { client, urlFor } from "@/app/lib/sanity";
import { PortableText } from "next-sanity";
import { Permanent_Marker } from "next/font/google";

async function getData(slug: string) {
  const query = `*[_type == 'beverage' && slug.current == '${slug}'] {
        "currentSlug": slug.current,
        title,
          labelImage,
          description,
          can,
          percentage,
          style,
          category,
          link,
          bgColor,
          backgroundImage,
          ingredients,          
      }[0]`;

  const data = await client.fetch(query);
  return data;
}

function getVolume(canType: string) {
  switch (canType) {
    case "black":
      return "33 Cl";
    case "white":
      return "33 Cl";
    case "big":
      return "44 Cl";
    case "sleek":
      return "25 Cl";
    default:
      return "33 cl";
  }
}

function getCat(canCat: string) {
  switch (canCat) {
    case "strong":
      return "Starköl";
    case "weak":
      return "Folköl";
    case "drink":
      return "Blanddryck";
    case "soda":
      return "Läsk";
    case "noalco":
      return "Alkoholfri öl";
    default:
      return "-";
  }
}

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

export default async function BeveragePage({
  params,
}: {
  params: { slug: string };
}) {
  const data: beverage = await getData(params.slug);
  return (
    <article>
      <BeerHero
        can={data.can}
        title={data.title}
        labelImage={data.labelImage}
        backgroundImage={data.backgroundImage}
      />
      <div
        className={`block beerBlock ${data.can}`}
        style={{ backgroundColor: data.bgColor }}
      >
        <div className="container">
          <div className="beerDesc">
            <div className={`beerHeader textCenter ${data.can}`}>
              <h1>{data.title}</h1>
              {data.style ? (
                <h4 className={`specialIngress ${permMarker.className}`}>
                  {data.style}
                </h4>
              ) : (
                <h4 className={`specialIngress ${permMarker.className}`}>
                  {getCat(data.category)}
                </h4>
              )}
              <div className="beerLandingPad"></div>
            </div>

            <div className="grid">
              <div className="col col-6">
                <div className="border"></div>
                <PortableText value={data.description} />
                {data.ingredients ? (
                  <div>
                    <h5>Innehåll</h5>
                    <PortableText value={data.ingredients} />
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="col col-6">
                <div className="border"></div>
                <div className="grid">
                  <div className="col col-6">
                    <h5>Typ</h5>

                    <h4 className={permMarker.className}>
                      {getCat(data.category)}
                    </h4>
                  </div>
                  {data.percentage ? (
                    <div className="col col-3">
                      <h5>ABV</h5>
                      <h4 className={permMarker.className}>
                        {data.percentage}%
                      </h4>
                    </div>
                  ) : (
                    ""
                  )}

                  <div className="col col-3">
                    <h5>Storlek</h5>
                    <h4 className={permMarker.className}>
                      {getVolume(data.can)}
                    </h4>
                  </div>
                  {data.link ? (
                    <div className="col col-4">
                      <h5>Beställ här</h5>

                      <a target="_blank" href={data.link}>
                        Systembolaget
                      </a>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
