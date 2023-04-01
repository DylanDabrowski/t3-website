import React from "react";
import Image from "next/image";

export default function AboutMe() {
  return (
    <div className="grid grid-cols-6 grid-rows-4 gap-1">
      {/* <p className="h-40 bg-green-200">1</p> */}
      <div className="">
        <SpinningSun />
      </div>
      <div className="col-start-2 col-end-7 ml-4">
        <h1 className="text-xl font-bold text-blue-300">ABOUT ME</h1>
        <p className="text-lg font-thin text-default-text">
          Full Stack Developer, based in Toronto, ON 📍
        </p>
        <div className="mt-2 flex items-center gap-4">
          <p className="text-md ml-2 font-semibold text-default-text">
            Tech Stack |
          </p>
          <div className="flex items-center justify-center rounded-full bg-white p-1.5">
            <Image
              src={"/html-logo.png"}
              alt="html icon"
              width={25}
              height={25}
            />
          </div>
          <div className="flex items-center justify-center rounded-full bg-white p-1.5">
            <Image
              src={"/css-logo.png"}
              alt="css icon"
              width={25}
              height={25}
            />
          </div>
          <div className="flex items-center justify-center rounded-full bg-white p-1.5">
            <Image src={"/ts-logo.png"} alt="ts icon" width={25} height={25} />
          </div>
          <div className="flex items-center justify-center rounded-full bg-white p-1.5">
            <Image
              src={"/tailwind-logo.png"}
              alt="tailwind icon"
              width={25}
              height={25}
            />
          </div>
        </div>
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
