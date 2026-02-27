import { PortableText } from '@portabletext/react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

export default function LandingHero({
  title,
  ingress,
  aboutTitle,
  aboutIngress,
  aboutDesc,
}: {
  title: string
  ingress: string
  aboutTitle: string
  aboutIngress: string
  aboutDesc: any
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', '90vh start'],
  })
  const beerY = useTransform(scrollYProgress, [0, 1], ['100%', '150%'])

  const trans = useTransform(scrollYProgress, [0, 1], ['0', '1'])
  const scaleTxt = useTransform(scrollYProgress, [0, 1], ['1.4', '1'])
  const color = useTransform(scrollYProgress, [0, 1], ['#fff', '#000'])
  const rotate = useTransform(scrollYProgress, [0, 1], ['0deg', '180deg'])

  return (
    <motion.div style={{ overflow: 'hidden', backgroundColor: color }}>
      <div ref={ref} className="landingHero textCenter">
        <div className="container">
          <div>
            <h1>{title}</h1>
            <h2 className="specialIngress font-marker">{ingress}</h2>
          </div>
        </div>
      </div>
      <motion.div className="landingCan" style={{ top: beerY }}>
        <motion.img
          className="beerCan"
          src="/images/can-top.png"
          width={800}
          height={800}
          alt={'beer'}
          style={{ rotate: rotate }}
        />
      </motion.div>
      <div className="aboutOverview">
        <motion.div
          className="container superSmall textCenter landingShortDesc"
          style={{
            opacity: trans,
            scale: scaleTxt,
          }}
        >
          <h2>{aboutTitle}</h2>
          <div className="border"></div>
          <h4 className="specialIngress font-marker">{aboutIngress}</h4>
          <PortableText value={aboutDesc} />
          <a href="/about" className="btn">
            Läs mer om oss
          </a>
        </motion.div>
      </div>
    </motion.div>
  )
}
