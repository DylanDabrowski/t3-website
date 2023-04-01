import React from "react";
import Image from "next/image";

export default function AboutMe() {
  return (
    <div className="relative">
      <div className="absolute h-full w-full ">
        <SpinningSun />
      </div>
      <Card2 />
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
