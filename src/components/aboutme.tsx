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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % content.length);
    }, 5000); // Increase the interval time to account for the additional animation duration
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative h-[550px]">
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
        className="absolute left-8 top-8"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        src={yellowCircle}
        alt="yellow circle"
        width={61}
        height={61}
      />
      <Image
        className="absolute left-0 top-0 animate-spin-slow"
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
    <div className="h-full">
      <div className="absolute left-44 top-10">
        <ShakingImage />
      </div>
      <div className="absolute left-96 top-20">
        <ShakingImage />
      </div>
      <div className="absolute left-[580px] top-8">
        <ShakingImage />
      </div>
      <div className="absolute left-24 top-40">
        <ShakingImage />
      </div>
      <div className="absolute left-80 top-52">
        <ShakingImage />
      </div>
      <div className="absolute left-[540px] top-44">
        <ShakingImage />
      </div>
      <div className="absolute left-10 top-72">
        <ShakingImage />
      </div>
      <div className="absolute left-64 top-[330px]">
        <ShakingImage />
      </div>
      <div className="absolute left-[500px] top-[320px]">
        <ShakingImage />
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
        <p className="text-2xl text-zinc-400">
          Born in 2000 to a Portuguese mother and Polish immigrant father, I am
          currently in my senior year of studying Computer Science. I work
          diligently on the skills I have, and I am always looking to learn
          more. Hopefully we can meet at a hackathon sometime soon! 🤝
        </p>
      </div>
      <div className="col-span-6">
        <p className="text-lg text-zinc-600">
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
        <p className="mx-8 text-xl text-zinc-400">
          Strong foundation in Full-Stack development. I started with Javascript
          then eventually became a fully immersed Typescript developer. I also
          use Tailwind on almost all of my own projects.
        </p>
      </div>
      <div className="col-span-4 row-start-3 flex items-center justify-center gap-8">
        <div className="flex items-center">
          <Image
            className="mr-4 h-10 w-10"
            src={htmlLogo}
            alt="html img"
            width={100}
            height={100}
          />
          <p className="text-xl font-bold text-default-text">HTML</p>
        </div>
        <div className="flex items-center">
          <Image
            className="mr-4 h-10 w-10"
            src={cssLogo}
            alt="css img"
            width={100}
            height={100}
          />
          <p className="text-xl font-bold text-default-text">CSS</p>
        </div>
        <div className="flex items-center">
          <Image
            className="mr-4 h-10 w-10"
            src={tsLogo}
            alt="typescript img"
            width={100}
            height={100}
          />
          <p className="text-xl font-bold text-default-text">Typescript</p>
        </div>
        <div className="flex items-center">
          <Image
            className="mr-4 h-10 w-10"
            src={tailwindLogo}
            alt="tailwind img"
            width={100}
            height={100}
          />
          <p className="text-xl font-bold text-default-text">Tailwind</p>
        </div>
      </div>
      <div className="col-span-4 row-start-4">
        <Image
          className="h-28 rounded-2xl object-cover"
          src={code}
          alt="stock image"
          width={1000}
          height={200}
        />
      </div>
    </div>
  );
}
