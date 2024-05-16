"use client";

import Image from "next/image";
import { Permanent_Marker } from "next/font/google";
import { PortableText } from "next-sanity";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

export default function EventOverview({
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

  const trans = useTransform(scrollYProgress, [0, 1], ["1", "0"]);
  const scal = useTransform(scrollYProgress, [0, 1], ["1", "1.2"]);
  const rot = useTransform(scrollYProgress, [0, 1], ["0deg", "20deg"]);

  return (
    <section ref={ref} className="eventsOverview darkSection">
      <div className="container marginLarge">
        <div className="grid centerAlign">
          <motion.div
            className="col col-6"
            style={{ scale: scal, opacity: trans }}
          >
            <h2>{title}</h2>
            <div className="border"></div>
            <h4 className={permMarker.className}>{ingress}</h4>
            <PortableText value={text} />
            <Link href="/book" className="btn">
              Ja! Jag vill ha kul
            </Link>
          </motion.div>
          <div className="col col-6">
            <motion.img
              src="/images/event.webp"
              width={640}
              height={640}
              alt={""}
              style={{ scale: scal, rotate: rot }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
