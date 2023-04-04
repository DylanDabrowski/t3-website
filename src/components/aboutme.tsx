import React, { useState, useEffect } from "react";
import Image from "next/image";
import ShakingImage from "./shakingimage";
import { motion, AnimatePresence } from "framer-motion";

const content = [
  { id: 1, content: <Card1 /> },
  { id: 2, content: <Waves /> },
];

export default function AboutMe() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % content.length);
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative h-[600px]">
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
          <motion.div
            key={`transition-${activeIndex}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {content[activeIndex]?.content}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SpinningSun() {
  return (
    <div className="relative h-32">
      <Image
        className="absolute left-8 top-8"
        src={"/yellow-circle.svg"}
        alt="yellow circle"
        width={61}
        height={61}
      />
      <Image
        className="absolute left-0 top-0 animate-spin-slow"
        src={"/ABOUT ME.svg"}
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
      <div className="absolute left-44">
        <ShakingImage />
      </div>
      <div className="absolute left-96 top-16">
        <ShakingImage />
      </div>
      <div className="absolute left-[650px]">
        <ShakingImage />
      </div>
      <div className="absolute left-20 top-40">
        <ShakingImage />
      </div>
      <div className="absolute left-80 top-60">
        <ShakingImage />
      </div>
      <div className="absolute left-[600px] top-52">
        <ShakingImage />
      </div>
      <div className="absolute top-80">
        <ShakingImage />
      </div>
      <div className="absolute left-72 top-[400px]">
        <ShakingImage />
      </div>
      <div className="absolute left-[560px] top-[380px]">
        <ShakingImage />
      </div>
    </div>
  );
}

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
          src={"/pfp.jpeg"}
          alt="profile picture"
          width={400}
          height={400}
        />
      </div>
      <div className="col-start-3 col-end-7 row-span-2 mt-4">
        <p className="text-2xl text-zinc-400">
          I am a Full Stack developer and a 4th year computer science student
          with hands-on co-op experiences and a number personal project
          accomplishments. I pride myself in my adaptability in the workplace,
          as well as my drive to create and improve the latest and greatest
          technologies.
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

function Card2() {
  return (
    <div className="grid grid-cols-6 grid-rows-4 gap-1">
      {/* <p className="h-40 bg-green-200">1</p> */}
      <div className="col-start-2 col-end-7 flex flex-col">
        <Image
          className="h-32 rounded-2xl object-cover"
          src={"/stock computer image.jpg"}
          alt="profile picture"
          width={1000}
          height={200}
        />
      </div>
      <div className="col-span-2 row-start-2 row-end-4 p-4">
        <Image
          className="rounded-2xl"
          src={"/pfp.jpeg"}
          alt="profile picture"
          width={400}
          height={400}
        />
      </div>
      <div className="col-start-3 col-end-7 row-span-2 mt-4">
        <p className="text-2xl text-zinc-400">
          I am a Full Stack developer and a 4th year computer science student
          with hands-on co-op experiences and a number personal project
          accomplishments. I pride myself in my adaptability in the workplace,
          as well as my drive to create and improve the latest and greatest
          technologies.
        </p>
      </div>
      <div className="col-span-6">
        <Image
          className="h-32 rounded-2xl object-cover"
          src={"/stock computer image.jpg"}
          alt="profile picture"
          width={1000}
          height={200}
        />
      </div>
    </div>
  );
}
