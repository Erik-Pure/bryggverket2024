"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { permMarker } from "../../lib/fonts";
import LandingStage from "./LandingStage";
import styles from "./landing.module.scss";
import type { FeaturedCan } from "./stage/LandingScene";

export type LandingContent = {
  title: string;
  ingress: string;
  aboutTitle: string;
  aboutIngress: string;
  aboutDesc: unknown;
  drinkTitle: string;
  drinkIngress: string;
  drinkDesc: unknown;
  eventTitle: string;
  eventIngress: string;
  eventDesc: unknown;
  merchTitle: string;
  merchIngress: string;
  merchDesc: unknown;
};

function Kicker({ index, children }: { index: number; children: string }) {
  return (
    <p className={styles.kicker}>
      <span className={styles.kickerIndex}>
        {String(index).padStart(2, "0")}
      </span>
      <span className={styles.kickerRule} />
      {children}
    </p>
  );
}

function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll-driven landing: sticky Remotion/Three cans choreograph the
 * brand story while CMS copy keeps the established Bryggverket voice.
 */
export default function LandingExperience({
  content,
  featured,
  glow,
}: {
  content: LandingContent;
  featured: [FeaturedCan, FeaturedCan, FeaturedCan];
  glow: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dark, setDark] = useState(false);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Mid-scroll lives in the dark brand world; hero opens light, merch closes light.
  const inkProgress = useTransform(
    scrollYProgress,
    [0, 0.08, 0.18, 0.78, 0.9, 1],
    [0, 0, 1, 1, 0, 0],
  );

  useEffect(() => {
    return inkProgress.on("change", (value) => {
      setDark(value > 0.45);
    });
  }, [inkProgress]);

  const heroCueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  return (
    <div
      ref={trackRef}
      className={`${styles.experience} ${dark ? styles.experienceDark : ""}`}
      data-landing-track
    >
      <div className={styles.track}>
        <LandingStage
          featured={featured}
          bg={dark ? "#050505" : "#f4f2ee"}
          glow={glow}
        />

        <div className={styles.chapters}>
          <section className={styles.hero} data-chapter="hero">
            <div className={`container ${styles.heroInner}`}>
              <Reveal>
                <h1 className={styles.heroTitle}>{content.title}</h1>
                <h2
                  className={`specialIngress ${styles.heroIngress} ${permMarker.className}`}
                >
                  {content.ingress}
                </h2>
              </Reveal>
              <motion.div
                className={styles.scrollCue}
                style={{ opacity: heroCueOpacity }}
                aria-hidden="true"
              >
                <Image
                  src="/images/spinner-can.svg"
                  width={72}
                  height={72}
                  alt=""
                />
              </motion.div>
            </div>
          </section>

          <section
            className={`${styles.chapter} ${styles.about}`}
            data-chapter="about"
          >
            <div className="container">
              <div className={`${styles.row} ${styles.rowStart}`}>
                <Reveal className={`${styles.copy} ${styles.copyWide}`}>
                  <Kicker index={1}>Om oss</Kicker>
                  <h2 className={styles.sectionTitle}>{content.aboutTitle}</h2>
                  <div className="border" />
                  <h4 className={`specialIngress ${permMarker.className}`}>
                    {content.aboutIngress}
                  </h4>
                  <div className={styles.sectionBody}>
                    <PortableText value={content.aboutDesc as never} />
                  </div>
                  <Link href="/about" className="btn">
                    Läs mer om oss
                  </Link>
                </Reveal>
              </div>
            </div>
          </section>

          <section
            className={`${styles.chapter} ${styles.drinks}`}
            data-chapter="drinks"
          >
            <div className="container">
              <div className={`${styles.row} ${styles.rowStart}`}>
                <Reveal className={styles.copy}>
                  <Kicker index={2}>Drycker</Kicker>
                  <h2 className={styles.sectionTitle}>{content.drinkTitle}</h2>
                  <div className="border" />
                  <h4 className={`specialIngress ${permMarker.className}`}>
                    {content.drinkIngress}
                  </h4>
                  <div className={styles.sectionBody}>
                    <PortableText value={content.drinkDesc as never} />
                  </div>
                  <Link href="/beverages" className="btn">
                    Alla våra drycker
                  </Link>
                </Reveal>
              </div>
            </div>
          </section>

          <section
            className={`${styles.chapter} ${styles.events}`}
            data-chapter="events"
          >
            <div className="container">
              <div className={`${styles.row} ${styles.rowEnd}`}>
                <div className={styles.eventsCopy}>
                  <Reveal className={styles.copy}>
                    <Kicker index={3}>Event</Kicker>
                    <h2 className={styles.sectionTitle}>
                      {content.eventTitle}
                    </h2>
                    <div className="border" />
                    <h4 className={`specialIngress ${permMarker.className}`}>
                      {content.eventIngress}
                    </h4>
                    <div className={styles.sectionBody}>
                      <PortableText value={content.eventDesc as never} />
                    </div>
                    <Link href="/book" className="btn">
                      Ja! Jag vill ha kul
                    </Link>
                  </Reveal>
                  <Reveal className={`${styles.media} ${styles.mediaMuted}`}>
                    <Image
                      src="/images/event.webp"
                      width={640}
                      height={640}
                      alt=""
                    />
                  </Reveal>
                </div>
              </div>
            </div>
          </section>

          <section
            className={`${styles.chapter} ${styles.merch}`}
            data-chapter="merch"
          >
            <div className="container">
              <Reveal className={styles.merchCopy}>
                <Kicker index={4}>Merch</Kicker>
                <h2 className={styles.sectionTitle}>{content.merchTitle}</h2>
                <h4 className={`specialIngress ${permMarker.className}`}>
                  {content.merchIngress}
                </h4>
                <div className={styles.sectionBody}>
                  <PortableText value={content.merchDesc as never} />
                </div>
                <a
                  className="btn black"
                  href="https://brewmerch.se/collections/bryggverket"
                  target="_blank"
                  rel="noopener"
                >
                  Brewmerch
                </a>
              </Reveal>
              <Reveal className={styles.merchMedia}>
                <Image
                  src="/images/merch.webp"
                  width={1024}
                  height={500}
                  alt=""
                />
              </Reveal>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
