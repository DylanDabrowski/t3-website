import React from "react";
import Image from "next/image";

export default function BlogCard(props: {
  title: string;
  description: string;
  date: string;
  imageUri: string;
}) {
  return (
    <div>
      {props.imageUri ? (
        <WithImage
          title={props.title}
          description={props.description}
          date={props.date}
          imageUri={props.imageUri}
        />
      ) : (
        <WithoutImage
          title={props.title}
          description={props.description}
          date={props.date}
        />
      )}
    </div>
  );
}

function WithImage(props: {
  title: string;
  description: string;
  date: string;
  imageUri: string;
}) {
  return (
    <div className="mb-14 mt-6 h-96 w-full cursor-pointer rounded-3xl shadow-lg transition ease-in-out hover:scale-105">
      <div className="flex h-6 w-full">
        <div className="mx-4 mt-2 h-[1px] w-full bg-zinc-700"></div>
        <p className="absolute mb-2 ml-10 bg-page-background px-2 text-xs font-semibold text-zinc-700">
          {props.date || ""}
        </p>
      </div>

      <Image
        className="h-96 w-full rounded-3xl bg-zinc-800 brightness-50"
        src={props.imageUri || "/stock computer image.jpg"}
        alt={"blog image"}
        style={{ objectFit: "cover" }}
        width={1000}
        height={500}
      />
      <div className="h-28 w-full -translate-y-28 rounded-b-3xl backdrop-blur-sm">
        <div className="absolute left-4 top-3">
          <p className="text-3xl font-bold text-default-text">
            {props.title || "Untitled"}
          </p>
          <p className="text-md mt-2 font-thin leading-tight text-default-text">
            {props.description || "No description"}
          </p>
        </div>
      </div>
    </div>
  );
}

function WithoutImage(props: {
  title: string;
  description: string;
  date: string;
}) {
  return (
    <div className="mb-14 mt-6 w-full cursor-pointer rounded-3xl shadow-lg transition ease-in-out hover:scale-105">
      <div className="flex h-6 w-full">
        <div className="mx-4 mt-2 h-[1px] w-full bg-zinc-700"></div>
        <p className="absolute mb-2 ml-10 bg-page-background px-2 text-xs font-semibold text-zinc-700">
          {props.date || ""}
        </p>
      </div>

      <div className="w-full rounded-b-3xl pb-4 pl-4 backdrop-blur-sm">
        <p className="text-3xl font-bold text-default-text">
          {props.title || "Untitled"}
        </p>
        <p className="text-md mt-2 font-thin leading-tight text-default-text">
          {props.description || "No description"}
        </p>
      </div>
    </div>
  );
}
