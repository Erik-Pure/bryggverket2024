"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { urlFor } from "../lib/sanity";
import { Permanent_Marker } from "next/font/google";

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

export default function BeerHero({
  can,
  title,
  labelImage,
  backgroundImage,
}: {
  can: string;
  title: string;
  labelImage: any;
  backgroundImage: any;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "70vh start"],
  });
  const beerY = useTransform(scrollYProgress, [0, 1], ["0%", "110%"]);
  const labelRotateX = useTransform(scrollYProgress, [0, 1], ["-180%", "-80%"]);
  const labelRotateY = useTransform(scrollYProgress, [0, 1], ["25deg", "0deg"]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 1], ["1", "0"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["14%", "60%"]);

  return (
    <div ref={ref} className="beerHero">
      <motion.div
        className={`beerTitle specialIngress ${permMarker.className}`}
        style={{ opacity: titleOpacity, top: titleY }}
      >
        <h2>{title}</h2>
      </motion.div>
      <motion.div style={{ opacity: titleOpacity }} className="scroller">
        <Image
          src={"/images/spinner-can.svg"}
          width={100}
          height={100}
          alt=""
        />
      </motion.div>

      <motion.div className="backdrop" style={{ y: foregroundY }}>
        {backgroundImage ? (
          <Image
            src={urlFor(backgroundImage).url()}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            alt=""
            objectFit="cover"
          />
        ) : (
          <Image
            className="shiftLeft"
            src={urlFor(labelImage).url()}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            alt=""
            objectFit="cover"
          />
        )}
      </motion.div>
      <motion.div
        className={`beerSlide ${can}`}
        style={{ y: beerY, rotate: labelRotateY }}
      >
        <div className="beerShowcase">
          <motion.img
            className="heroBeerLabel"
            src={urlFor(labelImage).url()}
            width={600}
            height={230}
            alt={"label"}
            style={{ left: labelRotateX }}
          />

          <div className="beerLabelShading"></div>
          <Image
            className="beerCan"
            src={`/images/${can}can.png`}
            width={270}
            height={500}
            alt={"beer"}
          />
        </div>
        <Image
          className="canShadow"
          src={`/images/can-shadow.png`}
          width={300}
          height={440}
          alt={"beer"}
        />
      </motion.div>
    </div>
  );
}
