import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export function CreationContinuum() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.13, 0.2, 0.7, 0.8, 0.92, 1], [0.84, 0.62, 0, 0, 0.72, 0.9, 0.92]);
  const scale = useTransform(scrollYProgress, [0, 0.18, 0.76, 1], [0.72, 0.88, 1, 1.08]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.75, 1], ["52vh", "36vh", "16vh", "8vh"]);
  const leftX = useTransform(scrollYProgress, [0, 0.74, 0.9, 1], [0, 0, 6, 10]);
  const rightX = useTransform(scrollYProgress, [0, 0.74, 0.9, 1], [0, 0, -6, -10]);

  return (
    <motion.figure
      className="creation-continuum"
      style={{
        opacity: reduceMotion ? 0.72 : opacity,
        scale: reduceMotion ? 0.78 : scale,
        y: reduceMotion ? "48vh" : y,
      }}
      aria-hidden="true"
    >
      <motion.img
        className="creation-half creation-half-left"
        src="/assets/images/creation-of-adam.webp"
        alt=""
        width="2400"
        height="1089"
        style={{ x: reduceMotion ? 0 : leftX }}
      />
      <motion.img
        className="creation-half creation-half-right"
        src="/assets/images/creation-of-adam.webp"
        alt=""
        width="2400"
        height="1089"
        style={{ x: reduceMotion ? 0 : rightX }}
      />
    </motion.figure>
  );
}
