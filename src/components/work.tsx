import React from "react";

export default function Work() {
  return (
    <div className="my-4">
      <Job1
        title={"Porter Airlines"}
        date={"May 2023 - Present"}
        description={
          "Started work at Porter Airlines in May of 2023 as a full-time Web Developer, currently working on flyporter.com"
        }
        gradientClass="bg-gradient-to-r from-sky-200 via-cyan-200 to-blue-300"
      />
      <Job2
        title={"Cloud DX"}
        date={"May 2022 - Apr 2023"}
        description={
          "Web Development lead for Cloud DX vital measurements device."
        }
        gradientClass="bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200"
      />

      <Job1
        title={"Code Ninjas"}
        date={"May 2020 - Dec 2020"}
        description={"Taught kids how to code in a fun and engaging way."}
        gradientClass="bg-gradient-to-r from-lime-200 via-purple-200 to-blue-200"
      />
    </div>
  );
}

function Job1(props: {
  title: string;
  date: string;
  description: string;
  gradientClass: string;
}) {
  return (
    <div className="my-8 flex w-full">
      <div className="mr-4">
        <h2
          className={`whitespace-nowrap ${props.gradientClass} min-h-[55px] bg-clip-text text-3xl font-extrabold leading-5 text-transparent md:text-5xl`}
        >
          {props.title}
        </h2>
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
  gradientClass: string;
}) {
  return (
    <div className="my-8 flex w-full justify-between">
      <div>
        <p className="text-xs text-zinc-700">{props.date}</p>
        <p className="md:text-md text-xs font-bold text-zinc-400">
          {props.description}
        </p>
      </div>
      <div className="ml-4 text-end">
        <h2
          className={`whitespace-nowrap ${props.gradientClass} bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl md:text-5xl`}
        >
          {props.title}
        </h2>
      </div>
    </div>
  );
}
