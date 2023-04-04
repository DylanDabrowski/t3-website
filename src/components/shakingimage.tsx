import * as React from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";

const getRandomTransformOrigin = () => {
  const value = (16 + 40 * Math.random()) / 100;
  const value2 = (15 + 36 * Math.random()) / 100;
  return {
    originX: value,
    originY: value2,
  };
};

const getRandomDelay = () => -(Math.random() * 0.7 + 0.05);

const randomDuration = () => Math.random() * 0.07 + 0.23;

const variants = {
  start: (i: number) => ({
    rotate: i % 2 === 0 ? [-1, 1.3, 0] : [1, -1.4, 0],
    transition: {
      delay: getRandomDelay(),
      repeat: Infinity,
      duration: randomDuration(),
    },
  }),
  reset: {
    rotate: 0,
  },
};

export default function ShakingImage() {
  const controls = useAnimation();

  return (
    <motion.div
      style={{
        ...getRandomTransformOrigin(),
      }}
      variants={variants}
      animate={"start"}
    >
      <Image
        className=""
        src={"/wave3.png"}
        alt="wave svg"
        width={125}
        height={125}
      />
    </motion.div>
  );
}
