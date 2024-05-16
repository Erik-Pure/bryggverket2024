"use client";

import { PortableText } from "next-sanity";
import Image from "next/image";
import { Permanent_Marker } from "next/font/google";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

export default function ({
  title,
  ingress,
  text,
}: {
  title: string;
  ingress: string;
  text: any;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 30vh", "0vh end"],
  });

  const scrollY = useTransform(scrollYProgress, [0, 1], ["0", "-100%"]);
  const trans = useTransform(scrollYProgress, [0, 1], ["1", "0"]);

  return (
    <section ref={ref} className="merchOverview">
      <div className="container textCenter narrow marginLarge">
        <motion.div style={{ marginTop: scrollY }}>
          <h2>{title}</h2>
          <h4 className={permMarker.className}>{ingress}</h4>
          <PortableText value={text} />
          <a
            className="btn black"
            href="https://brewmerch.se/collections/bryggverket"
            target="_blank"
          >
            Brewmerch
          </a>
        </motion.div>
        <Image
          className="beerCan"
          src="/images/merch.webp"
          width={1024}
          height={500}
          alt={""}
        />
      </div>
    </section>
  );
}
