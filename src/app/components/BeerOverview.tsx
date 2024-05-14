"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Permanent_Marker } from "next/font/google";
import Link from "next/link";
import React, { useRef } from "react";
import { PortableText } from "next-sanity";
import Image from "next/image";

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

export default function BeerOverview({
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
    offset: ["start start", "0vh end"],
  });
  const beerOne = useTransform(scrollYProgress, [0, 1], ["-30%", "70%"]);
  const beerTwo = useTransform(scrollYProgress, [0, 1], ["-40%", "230%"]);
  const beerThree = useTransform(scrollYProgress, [0, 1], ["0%", "300%"]);
  const opac = useTransform(scrollYProgress, [0, 1], ["1", "0"]);
  const scal = useTransform(scrollYProgress, [0, 1], ["1", "1.4"]);

  return (
    <section ref={ref} className="beersOverview darkSection">
      <div className="container">
        <div className="grid centerAlign">
          <motion.div
            className="col col-6"
            style={{ opacity: opac, scale: scal }}
          >
            <h2>{title}</h2>
            <div className="border"></div>
            <h4 className={permMarker.className}>{ingress}</h4>
            <PortableText value={text} />
            <Link href="/beverages" className="btn">
              Alla våra drycker
            </Link>
          </motion.div>
          <div className="col col-6">
            <motion.img
              className="fadeCan one"
              src="/images/can-faded.png"
              width={300}
              height={400}
              alt={""}
              style={{ marginTop: beerOne, opacity: opac }}
            />
            <motion.img
              className="fadeCan two"
              src="/images/can-faded.png"
              width={300}
              height={400}
              alt={""}
              style={{ top: beerTwo, opacity: opac }}
            />
            <motion.img
              className="fadeCan three"
              src="/images/can-faded.png"
              width={300}
              height={400}
              alt={""}
              style={{ top: beerThree, opacity: opac }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
