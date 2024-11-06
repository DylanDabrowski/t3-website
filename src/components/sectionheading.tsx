import React from "react";

export default function SectionHeading(props: { text: string }) {
  return (
    <div className="flex h-14 w-full">
      <div className="mx-4 mt-5 h-[1px] w-full bg-default-text"></div>
      <h1 className="absolute mb-2 ml-10 bg-page-background px-2 text-3xl font-semibold text-default-text">
        {props.text ? props.text : ""}
      </h1>
    </div>
  );
}
