import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

export function CreationContinuum() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 58, damping: 24, mass: .45 });
  const scale = useTransform(progress, [0, .5, 1], [.78, 1.02, 1.34]);
  const leftX = useTransform(progress, [0, .72, 1], ["-6vw", "-.5vw", "2.05vw"]);
  const rightX = useTransform(progress, [0, .72, 1], ["6vw", ".5vw", "-2.05vw"]);
  const leftRotate = useTransform(progress, [0, 1], [-1.4, .2]);
  const rightRotate = useTransform(progress, [0, 1], [1.4, -.2]);
  const opacity = useTransform(progress, [0, .12, .3, .68, .84, 1], [.88, .48, .12, .08, .38, .92]);

  const calmStyle = { x: 0, scale: .9, rotate: 0, opacity: .34 };

  return (
    <div className="creation-continuum" aria-hidden="true">
      <div className="creation-image-shell">
        <motion.div
          className="creation-half creation-half-adam"
          style={reduceMotion ? calmStyle : { x: leftX, scale, rotate: leftRotate, opacity }}
        >
          <img src="/assets/images/creation-hands.webp" alt="" decoding="async" />
        </motion.div>
        <motion.div
          className="creation-half creation-half-divine"
          style={reduceMotion ? calmStyle : { x: rightX, scale, rotate: rightRotate, opacity }}
        >
          <img src="/assets/images/creation-hands.webp" alt="" decoding="async" />
        </motion.div>
      </div>
    </div>
  );
}
