"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { urlFor } from "../lib/sanity";

export default function BeerHero({
  can,
  bgColor,
  labelImage,
  backgroundImage,
}: {
  can: string;
  bgColor: string;
  labelImage: any;
  backgroundImage: any;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "30vh start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const labelRotateX = useTransform(scrollYProgress, [0, 1], ["-180%", "-80%"]);
  const labelRotateY = useTransform(scrollYProgress, [0, 1], ["15deg", "0deg"]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <div
      ref={ref}
      className={`beerHero ${can}`}
      style={{ backgroundColor: bgColor }}
    >
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
        className="beerSlide"
        style={{ y: backgroundY, rotate: labelRotateY }}
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
            width={320}
            height={600}
            alt={"beer"}
          />
        </div>
      </motion.div>
    </div>
  );
}
