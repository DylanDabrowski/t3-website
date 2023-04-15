import React from "react";
import SectionHeading from "./sectionheading";

export default function Work() {
  return (
    <div className="my-4">
      <Job1 />
      <Job2 />
    </div>
  );
}

function Job1() {
  return (
    <div className="my-8 flex w-full">
      <div className="min-w-[240px]">
        <h1 className="text-5xl font-bold text-yellow-200">Cloud DX</h1>
        <h1 className="-mt-7 text-5xl font-bold text-orange-200">Cloud DX</h1>
        <h1 className="-mt-7 text-5xl font-bold text-red-200">Cloud DX</h1>
      </div>
      <div>
        <p className="text-xs text-zinc-700">May 2022 - Apr 2023</p>
        <p className="text-md font-bold text-zinc-400">
          Web Develepment lead for Cloud DX vital measurements device. Had the
          pleasure of working on modern web graphing features for hospitals
          around the world.
        </p>
      </div>
    </div>
  );
}

function Job2() {
  return (
    <div className="my-8 flex w-full justify-between">
      <div className="">
        <p className="text-xs text-zinc-700">May 2020 - Dec 2020</p>
        <p className="text-md font-bold text-zinc-400">
          Taught kids how to code in a fun and engaging way. To this day one of
          my favorite jobs, soley because of the impact I felt I was able to
          have teaching with the students.
        </p>
      </div>
      <div className="min-w-[280px] text-end">
        <h1 className="text-5xl font-bold text-lime-200">Code Ninjas</h1>
        <h1 className="-mt-7 text-5xl font-bold text-purple-200">
          Code Ninjas
        </h1>
        <h1 className="-mt-7 text-5xl font-bold text-blue-200">Code Ninjas</h1>
      </div>
    </div>
  );
}
