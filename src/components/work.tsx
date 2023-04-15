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
      <div className="w-[400px]">
        <h1 className="text-5xl font-bold text-yellow-100">Cloud DX</h1>
        <h1 className="-mt-8 text-5xl font-bold text-green-100">Cloud DX</h1>
        <h1 className="-mt-8 text-5xl font-bold text-red-100">Cloud DX</h1>
      </div>
      <div>
        <p className="text-xs text-zinc-700">May 2022 - Apr 2023</p>
        <p className="text-md font-bold text-zinc-400">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed felis
          leo, porta id neque quis, molestie aliquet quam. Proin sodales.
        </p>
      </div>
    </div>
  );
}

function Job2() {
  return (
    <div className="my-8 flex w-full">
      <div>
        <p className="text-xs text-zinc-700">May 2020 - Dec 2020</p>
        <p className="text-md font-bold text-zinc-400">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed felis
          leo, porta id neque quis, molestie aliquet quam. Proin sodales.
        </p>
      </div>
      <div className="w-[600px] text-end">
        <h1 className="text-5xl font-bold text-lime-100">Code Ninjas</h1>
        <h1 className="-mt-8 text-5xl font-bold text-purple-100">
          Code Ninjas
        </h1>
        <h1 className="-mt-8 text-5xl font-bold text-blue-100">Code Ninjas</h1>
      </div>
    </div>
  );
}
