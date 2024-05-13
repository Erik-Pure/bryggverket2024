import type { Metadata } from "next";
import { Saira } from "next/font/google";
import { Permanent_Marker } from "next/font/google";
import Image from "next/image";
import "./globals.scss";
import Link from "next/link";

const saira = Saira({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bryggverket",
  description: "Bryggverket - How can less be more? Ett bryggeri från Umeå",
};

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={saira.className}>
        <header>
          <Link href="/">
            <Image
              src="images/bryggverket_horizontal_white.svg"
              alt="Bryggverket"
              width={200}
              height={40}
              priority
            />
          </Link>
          <ul>
            <li>
              <Link href="/beverages">Våra drycker</Link>
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
              >
                Merch
              </a>
            </li>
          </ul>
        </header>
        {children}
        <footer>
          <div className="grid">
            <div className="col col-3">
              <Link href="/">
                <Image
                  src="images/bryggverket_horizontal_white.svg"
                  alt="Bryggverket"
                  width={200}
                  height={40}
                  priority
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
