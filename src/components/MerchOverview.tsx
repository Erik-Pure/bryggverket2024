import { PortableText } from "@portabletext/react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function MerchOverview({
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

  return (
    <section ref={ref} className="merchOverview">
      <div className="container textCenter narrow marginLarge">
        <motion.div style={{ marginTop: scrollY }}>
          <h2>{title}</h2>
          <h4 className="font-marker">{ingress}</h4>
          <PortableText value={text} />
          <a
            className="btn black"
            href="https://brewmerch.se/collections/bryggverket"
            target="_blank"
            rel="noopener"
          >
            Brewmerch
          </a>
        </motion.div>
        <img
          className="beerCan"
          src="/images/merch.webp"
          width={1024}
          height={500}
          alt=""
        />
      </div>
    </section>
  );
}
