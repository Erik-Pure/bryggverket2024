import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { urlFor } from "@/lib/sanity";

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
        className="beerTitle specialIngress font-marker"
        style={{ opacity: titleOpacity, top: titleY }}
      >
        <h2>{title}</h2>
      </motion.div>
      <motion.div style={{ opacity: titleOpacity }} className="scroller">
        <img src="/images/spinner-can.svg" width={100} height={100} alt="" />
      </motion.div>

      <motion.div className="backdrop" style={{ y: foregroundY }}>
        {backgroundImage ? (
          <img
            src={urlFor(backgroundImage).url()}
            alt=""
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        ) : (
          <img
            className="shiftLeft"
            src={urlFor(labelImage).url()}
            alt=""
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
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
            alt="label"
            style={{ left: labelRotateX }}
          />

          <div className="beerLabelShading"></div>
          <img
            className="beerCan"
            src={`/images/${can}can.png`}
            width={270}
            height={500}
            alt="beer"
          />
        </div>
        <img
          className="canShadow"
          src="/images/can-shadow.png"
          width={300}
          height={440}
          alt="beer"
        />
      </motion.div>
    </div>
  );
}
