import React from "react";
import Image from "next/image";

import pfp from "../assets/pfp.jpeg";
import linkedinIcon from "../assets/gradient linkedin.svg";
import instagramIcon from "../assets/gradient instagram.svg";
import githubIcon from "../assets/gradient github.svg";
import mailIcon from "../assets/gradient mail.svg";

export default function Hero() {
  return (
    <div className="mb-10">
      <div className="flex items-center">
        <Image
          className="mr-10 rounded-full bg-gradient-to-br from-green-100 to-blue-200 p-1"
          src={pfp}
          alt={"profile picture"}
          width={80}
          height={80}
        />
        <div>
          <p className="text-3xl font-bold text-default-text">Dylan</p>
          <p className="font-extralight text-default-text">Software Engineer</p>
        </div>
      </div>
      <p className="mt-8 text-xl font-thin text-default-text">
        Hi my name is Dylan, welcome to my website! Here you kind learn about
        me, my work, and some of my latest projects.
      </p>
      <div className="mt-4 flex items-center">
        <a
          href={"https://www.linkedin.com/in/dylandabrowski/"}
          className="flex items-center"
          target="_blank"
        >
          <Image
            className="mr-2"
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            src={linkedinIcon}
            alt={"linkedin icon"}
            width={24}
            height={24}
          />
          <p className="mr-6 text-sm font-bold tracking-wide text-default-text">
            LinkedIn
          </p>
        </a>
        <a
          href={"https://www.instagram.com/dylandabrowski/"}
          className="flex items-center"
          target="_blank"
        >
          <Image
            className="mr-2"
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            src={instagramIcon}
            alt={"instagram icon"}
            width={24}
            height={24}
          />
          <p className="mr-6 text-sm font-bold tracking-wide text-default-text">
            Instagram
          </p>
        </a>
        <a
          href={"https://github.com/DylanDabrowski"}
          className="flex items-center"
          target="_blank"
        >
          <Image
            className="mr-2"
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            src={githubIcon}
            alt={"github icon"}
            width={24}
            height={24}
          />
          <p className="mr-6 text-sm font-bold tracking-wide text-default-text">
            Github
          </p>
        </a>
        <a
          href={"mailto:dylandabrowski@gmail.com"}
          className="flex items-center"
          target="_blank"
        >
          <Image
            className="mr-2"
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            src={mailIcon}
            alt={"mail icon"}
            width={24}
            height={24}
          />
          <p className="mr-6 text-sm font-bold tracking-wide text-default-text">
            Mail
          </p>
        </a>
      </div>
    </div>
  );
}
