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
    <div className="relative h-[450px] md:h-[550px]">
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

import pfp from "../assets/pfp.jpeg";
function Card1() {
  return (
    <div className="grid grid-cols-6 grid-rows-4 gap-1">
      {/* <p className="h-40 bg-green-200">1</p> */}
      <div className="col-start-3 col-end-7 flex flex-col justify-end">
        <h1 className="text-xl font-bold text-blue-300">ABOUT ME</h1>
        <p className="text-lg font-thin text-default-text">
          Full Stack Developer, based in Toronto, ON 📍
        </p>
      </div>
      <div className="col-span-2 row-start-2 row-end-4 p-4">
        <Image
          className="rounded-2xl"
          src={pfp}
          alt="profile picture"
          width={400}
          height={400}
        />
      </div>
      <div className="col-start-3 col-end-7 row-span-2 mt-4">
        <p className="text-sm text-zinc-400 md:text-2xl">
          Born in 2000 to a Portuguese mother and Polish immigrant father, I am
          currently in my senior year of studying Computer Science. I work
          diligently on the skills I have, and I am always looking to learn
          more. Hopefully we can meet at a hackathon sometime soon! 🤝
        </p>
      </div>
      <div className="col-span-6">
        <p className="text-md text-zinc-600 md:text-lg">
          The best way to contact me is through my email, but I love connecting
          on linkedin or other social medias! 📫
        </p>
      </div>
    </div>
  );
}

import htmlLogo from "../assets/html-logo.png";
import cssLogo from "../assets/css-logo.png";
import tsLogo from "../assets/ts-logo.png";
import tailwindLogo from "../assets/tailwind-logo.png";
import code from "../assets/code.jpeg";
function Card2() {
  return (
    <div className="grid grid-cols-4 grid-rows-4 gap-1">
      <div className="col-span-4 flex items-end justify-center">
        <h1 className="text-3xl font-bold text-default-text">Tech Stack</h1>
      </div>
      <div className="col-span-4 flex items-end">
        <p className="mt-4 text-sm text-zinc-400 md:mx-8 md:text-xl">
          Strong foundation in Full-Stack development. I started with Javascript
          then eventually became a fully immersed Typescript developer. I also
          use Tailwind on almost all of my own projects.
        </p>
      </div>
      <div className="col-span-4 row-start-3 flex items-center justify-center gap-2 md:gap-8">
        <div className="flex items-center">
          <Image
            className="mr-1 h-8 w-8 md:mr-4 md:h-10 md:w-10"
            src={htmlLogo}
            alt="html img"
            width={100}
            height={100}
          />
          <p className="text-xs font-bold text-default-text md:text-xl">HTML</p>
        </div>
        <div className="flex items-center">
          <Image
            className="mr-1 h-8 w-8 md:mr-4 md:h-10 md:w-10"
            src={cssLogo}
            alt="css img"
            width={100}
            height={100}
          />
          <p className="text-xs font-bold text-default-text md:text-xl">CSS</p>
        </div>
        <div className="flex items-center">
          <Image
            className="mr-4 h-8 w-8 md:mr-1 md:h-10 md:w-10"
            src={tsLogo}
            alt="typescript img"
            width={100}
            height={100}
          />
          <p className="text-xs font-bold text-default-text md:text-xl">
            Typescript
          </p>
        </div>
        <div className="flex items-center">
          <Image
            className="mr-4 h-8 w-8 md:mr-1 md:h-10 md:w-10"
            src={tailwindLogo}
            alt="tailwind img"
            width={100}
            height={100}
          />
          <p className="text-xs font-bold text-default-text md:text-xl">
            Tailwind
          </p>
        </div>
      </div>
      <div className="col-span-4 row-start-4">
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
