"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Permanent_Marker } from "next/font/google";
import SplineViewer from "./SplineViewer";
import Link from "next/link";
import React, { useRef } from "react";
import { PortableText } from "next-sanity";

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

export default function LandingHero({
  title,
  ingress,
  aboutTitle,
  aboutIngress,
  aboutDesc,
}: {
  title: string;
  ingress: string;
  aboutTitle: string;
  aboutIngress: string;
  aboutDesc: any;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "70vh start"],
  });
  const beerY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const trans = useTransform(scrollYProgress, [0, 1], ["0", "1"]);
  const scaleTxt = useTransform(scrollYProgress, [0, 1], ["1.4", "1"]);
  const color = useTransform(scrollYProgress, [0, 1], ["#fff", "#000"]);

  return (
    <motion.div style={{ backgroundColor: color }}>
      <div ref={ref} className="landingHero textCenter">
        <div className="container">
          <div>
            <h1>{title}</h1>
            <h2 className={`specialIngress ${permMarker.className}`}>
              {ingress}
            </h2>
          </div>
        </div>
      </div>
      <motion.div className="landingSpline" style={{ top: beerY }}>
        <SplineViewer
          url={"https://prod.spline.design/gkMXnTon7dIKCyc5/scene.splinecode"}
        />
      </motion.div>
      <div className="aboutOverview">
        <motion.div
          className="container superSmall textCenter landingShortDesc"
          style={{
            opacity: trans,
            scale: scaleTxt,
            top: beerY,
          }}
        >
          <h2>{aboutTitle}</h2>
          <div className="border"></div>
          <h4 className={`specialIngress ${permMarker.className}`}>
            {aboutIngress}
          </h4>
          <PortableText value={aboutDesc} />
          <Link href="/about" className="btn">
            Läs mer om oss
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
