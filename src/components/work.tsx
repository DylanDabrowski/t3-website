import React from "react";
import SectionHeading from "./sectionheading";

export default function Work() {
  return (
    <div className="my-4">
      <Job1
        title={"Porter Airlines"}
        date={"May 2023 - Present"}
        description={
          "Starting my position as a Web Developer for Porter Airlines on May 10th 2023!"
        }
        color1={"text-sky-200"}
        color2={"text-cyan-200"}
        color3={"text-blue-300"}
      />
      <Job2
        title={"Cloud DX"}
        date={"May 2022 - Apr 2023"}
        description={
          "Web Develepment lead for Cloud DX vital measurements device. Had the pleasure of working on modern web graphing features for hospitals around the world."
        }
        color1={"text-yellow-200"}
        color2={"text-orange-200"}
        color3={"text-red-200"}
      />
      <Job1
        title={"Code Ninjas"}
        date={"May 2020 - Dec 2020"}
        description={
          "Taught kids how to code in a fun and engaging way. To this day one of my favorite jobs, soley because of the impact I felt I was able to have teaching with the students."
        }
        color1={"text-lime-200"}
        color2={"text-purple-200"}
        color3={"text-blue-200"}
      />
    </div>
  );
}

function Job1(props: {
  title: string;
  date: string;
  description: string;
  color1: string;
  color2: string;
  color3: string;
}) {
  return (
    <div className="my-8 flex w-full">
      <div className="mr-4">
        <h1
          className={`whitespace-nowrap text-3xl font-bold ${props.color1} text- md:text-5xl`}
        >
          {props.title}
        </h1>
        <h1
          className={`-mt-7 whitespace-nowrap text-3xl font-bold ${props.color2} md:text-5xl`}
        >
          {props.title}
        </h1>
        <h1
          className={`-mt-7 whitespace-nowrap text-3xl font-bold ${props.color3} md:text-5xl`}
        >
          {props.title}
        </h1>
      </div>
      <div>
        <p className="text-xs text-zinc-700">{props.date}</p>
        <p className="md:text-md text-xs font-bold text-zinc-400">
          {props.description}
        </p>
      </div>
    </div>
  );
}

function Job2(props: {
  title: string;
  date: string;
  description: string;
  color1: string;
  color2: string;
  color3: string;
}) {
  return (
    <div className="my-8 flex w-full justify-between">
      <div className="">
        <p className="text-xs text-zinc-700">{props.date}</p>
        <p className="md:text-md text-xs font-bold text-zinc-400">
          {props.description}
        </p>
      </div>
      <div className="ml-4 text-end">
        <h1
          className={`whitespace-nowrap text-3xl font-bold ${props.color1} md:text-5xl`}
        >
          {props.title}
        </h1>
        <h1
          className={`-mt-7 whitespace-nowrap text-3xl font-bold ${props.color2} md:text-5xl`}
        >
          {props.title}
        </h1>
        <h1
          className={`-mt-7 whitespace-nowrap text-3xl font-bold ${props.color3} md:text-5xl`}
        >
          {props.title}
        </h1>
      </div>
    </div>
  );
}
