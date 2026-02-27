import type { Metadata } from "next";
import Image from "next/image";
import "./globals.scss";
import Link from "next/link";
import AgeGate from "./components/AgeGate";
import { permMarker, saira } from "./lib/fonts";

export const metadata: Metadata = {
  title: "Bryggverket",
  description: "Bryggverket - How can less be more? Ett bryggeri från Umeå",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <head>
        <link rel="shortcut icon" href="/images/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/favicon/favicon-16x16.png"
        />
      </head>
      <body className={saira.className}>
        <AgeGate />
        <header>
          <Link className="logo" href="/">
            <Image
              src="images/bryggverket_horizontal_white.svg"
              alt="Bryggverket"
              width={200}
              height={40}
            />
          </Link>
          <ul>
            <li>
              <Link href="/beverages">Drycker</Link>
            </li>
            <li>
              <Link href="/book">Boka</Link>
            </li>
            <li>
              <Link href="/about">Om oss</Link>
            </li>
            {/*  <li>
              <Link href="/contact">Kontakt</Link>
            </li> */}
            <li>
              <a
                href="https://brewmerch.se/collections/bryggverket"
                target="_blank"
                rel="noopener"
              >
                Merch
              </a>
            </li>
          </ul>
        </header>
        {children}
        <footer>
          <div className="grid">
            <div className="col col-3 textCenter">
              <Link href="/">
                <Image
                  src="images/bv-icon.svg"
                  alt="Bryggverket"
                  width={120}
                  height={120}
                />
              </Link>
            </div>
            <div className="col col-3">
              <h5 className={permMarker.className}>Följ oss</h5>
              <ul>
                <li>
                  <a href="https://instagram.com/bryggverket">Instagram</a>
                </li>
                <li>
                  <a href="https://facebook.com/bryggverket">Facebook</a>
                </li>
                <li>
                  <a href="https://twitter.com/bryggverket">X</a>
                </li>
                <li>
                  <a href="https://untappd.com/Bryggverket">Untappd</a>
                </li>
                <li>
                  <a href="https://www.systembolaget.se/sortiment/?q=bryggverket">
                    Systembolaget
                  </a>
                </li>
              </ul>
            </div>
            <div className="col col-3">
              <h5 className={permMarker.className}>Elbrev</h5>
              <ul>
                <li>
                  <a href="mailto:hej@bryggverket.se">hej@bryggverket.se</a>
                </li>
              </ul>
              <h5 className={permMarker.className}>Snigelbrev</h5>
              <ul>
                <li>Bryggverket</li>
                <li>Förrådsvägen 22</li>
                <li>901 32 Umeå</li>
              </ul>
            </div>
            <div className="col col-3">
              <h5 className={permMarker.className}>Besöksadress</h5>
              <ul>
                <li>Förrådsvägen 22</li>
                <li>901 32 Umeå</li>
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
