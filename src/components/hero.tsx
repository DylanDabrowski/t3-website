import React from "react";
import Image from "next/image";

export default function Hero() {
  return (
    <div className="mb-10">
      <div className="flex items-center">
        <Image
          className="mr-10 rounded-full bg-gradient-to-br from-green-100 to-blue-200 p-1"
          src={"/pfp.jpeg"}
          alt={"profile picture"}
          width={80}
          height={80}
        />
        <div>
          <p className="text-default-text text-3xl font-bold">Dylan</p>
          <p className="text-default-text font-extralight">Software Engineer</p>
        </div>
      </div>
      <p className="text-default-text mt-8 text-xl font-thin">
        Hi my name is Dylan, welcome to my website! Here I blog about my latest
        projects and experiences, feel free to reach out for information.
      </p>
      <div className="mt-4 flex items-center">
        <SocialMedia
          icon={"/gradient linkedin.svg"}
          text={"LinkedIn"}
          link="https://www.linkedin.com/in/dylandabrowski/"
        />
        <SocialMedia
          icon={"/gradient instagram.svg"}
          text={"Instagram"}
          link="https://www.instagram.com/dylandabrowski/"
        />
        <SocialMedia
          icon={"/gradient github.svg"}
          text={"Github"}
          link="https://github.com/DylanDabrowski"
        />
        <SocialMedia
          icon={"/gradient mail.svg"}
          text={"Mail"}
          link="mailto:dylandabrowski@gmail.com"
        />
      </div>
    </div>
  );
}

function SocialMedia(props: { icon: string; text: string; link: string }) {
  return (
    <a href={props.link} className="flex items-center" target="_blank">
      <Image
        className="mr-2"
        src={props.icon}
        alt={props.icon + " icon"}
        width={24}
        height={24}
      />
      <p className="text-default-text text-md mr-6 font-bold tracking-wide">
        {props.text}
      </p>
    </a>
  );
}
