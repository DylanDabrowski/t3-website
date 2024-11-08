import React, { useState, useEffect } from "react";
import Image from "next/image";
import ShakingImage from "./shakingimage";
import { motion, AnimatePresence } from "framer-motion";

const cards = [<Card1 key={1} />, <Card2 key={2} />]; // Add as many cards as you want
const content = cards.flatMap((card) => [
  { content: card },
  { content: <Waves /> },
]);

export default function AboutMe() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isWaves, setIsWaves] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(
      () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % content.length);
        setIsWaves(!isWaves);
      },
      isWaves ? 2000 : 15000
    ); // Increase the interval time to account for the additional animation duration
    return () => clearInterval(intervalId);
  }, [isWaves]);

  return (
    <div className="relative h-[450px] md:h-[500px]">
      <div className="absolute h-full w-full ">
        <SpinningSun />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, translateX: -30 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: 30 }}
          transition={{ duration: 0.5 }}
        >
          {content[activeIndex]?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

import yellowCircle from "../assets/yellow-circle.svg";
import aboutMeText from "../assets/ABOUT ME.svg";
function SpinningSun() {
  return (
    <div className="relative">
      <Image
        className="absolute left-[25px] top-[25px] w-[50px] md:left-8 md:top-8 md:w-[60px]"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        src={yellowCircle}
        alt="yellow circle"
        width={100}
        height={100}
      />
      <Image
        className="absolute left-0 top-0 w-[100px] animate-spin-slow md:left-0 md:top-0 md:w-[125px]"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        src={aboutMeText}
        alt="yellow circle"
        width={125}
        height={125}
      />
    </div>
  );
}

function Waves() {
  return (
    <div className="flex h-full w-full justify-center">
      <div className="absolute h-full w-[400px] md:block md:w-full">
        <div className="absolute left-[140px] top-[40px] md:left-[200px] md:top-[40px]">
          <ShakingImage />
        </div>
        <div className="absolute left-[60px] top-[150px] md:left-[112px] md:top-[170px]">
          <ShakingImage />
        </div>
        <div className="absolute left-[20px] top-[270px] md:left-[40px] md:top-[300px]">
          <ShakingImage />
        </div>

        <div className="absolute left-[280px] top-[60px] md:left-[400px] md:top-[80px]">
          <ShakingImage />
        </div>
        <div className="absolute left-[230px] top-[180px] md:left-[340px] md:top-[200px]">
          <ShakingImage />
        </div>
        <div className="absolute left-[200px] top-[300px] md:left-[260px] md:top-[330px]">
          <ShakingImage />
        </div>

        <div className="absolute hidden md:left-[620px] md:top-[32px] md:block">
          <ShakingImage />
        </div>
        <div className="absolute hidden md:left-[575px] md:top-[175px] md:block">
          <ShakingImage />
        </div>
        <div className="absolute hidden md:left-[500px] md:top-[320px] md:block">
          <ShakingImage />
        </div>
      </div>
    </div>
  );
}

function Card1() {
  return (
    <div className="pt-[70px]">
      {/* <p className="h-40 bg-green-200">1</p> */}
      <div className="ml-[150px]">
        <h2 className="text-xl font-bold text-blue-300">ABOUT ME</h2>
        <p className="text-lg font-thin text-default-text">
          Full Stack Dev, based in Toronto, ON 📍
        </p>
      </div>
      <div className="mt-16">
        <p className="text-sm text-zinc-400 md:text-2xl">
          I am a Web Developer at Porter Airlines, I love meeting new people and
          hope to make more connections 🤝
        </p>
      </div>
      <div className="mt-28">
        <p className="text-md text-zinc-600 md:text-lg">
          The best way to contact me is through my email, but I love connecting
          on linkedin, instagram or other social medias! 📫
        </p>
      </div>
    </div>
  );
}

import code from "../assets/code.jpeg";
function Card2() {
  return (
    <div className="pt-[90px]">
      <div className="ml-[150px]">
        <h2 className="text-3xl font-bold text-default-text">Tech Stack</h2>
      </div>
      <div className="mt-10">
        <p className="mt-4 text-sm text-zinc-400 md:mx-8 md:text-xl">
          I have a strong foundation in HTML, CSS, JavaScript/TypeScript, and
          C#. Currently, I am primarily developing in .NET and occasionally
          using Next.js for work. Additionally, I have experience with a broader
          tech stack in other languages and frameworks. Please feel free to
          reach out about my credentials if you would like to learn more!
        </p>
      </div>
      <div className="mt-10">
        <Image
          className="h-16 rounded-2xl object-cover md:h-28"
          src={code}
          alt="stock image"
          width={1000}
          height={200}
        />
      </div>
    </div>
  );
}
