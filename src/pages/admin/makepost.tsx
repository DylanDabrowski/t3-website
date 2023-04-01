import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { useEffect, useState } from "react";
import { updateTextareaHeight } from "~/utils/functions";
import Divider from "~/components/divider";

const MakePost: NextPage<{ id: string }> = ({ id }) => {
  const [title, setTitle] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("");

  return (
    <>
      <Head>
        <title>Make a Post</title>
      </Head>
      <PageLayout>
        <div>
          <p className="text-3xl font-bold text-default-text">Make a post</p>
          <Divider space={30} />
          <input
            type="text"
            className="w-full break-words bg-page-background text-5xl font-bold text-default-text"
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
          <textarea
            className="no-scrollbar mb-12 mt-6 h-6 w-full resize-none bg-page-background font-extralight text-default-text"
            placeholder="Subtitle"
            value={subtitle}
            onChange={(e) => {
              updateTextareaHeight(e);
              setSubtitle(e.target.value);
            }}
          />

          {/* <div>
        {blocks.map((block, index) => (
          <div key={index}>{getBlock(block.type, block.id)}</div>
        ))}
      </div> */}
          <div className="mt-10 flex h-6 w-full">
            <div className="mt-2 h-[1px] w-full bg-zinc-700"></div>
            <p className="absolute mb-2 ml-10 bg-page-background px-2 text-xs font-semibold text-zinc-700">
              Add a new section to the post
            </p>
          </div>
          <div className="mb-40 flex justify-between">
            <div className="flex">
              <AddButton
                icon="/Add Text Button.svg"
                text="Add Text"
                handleClick={() => {
                  console.log("Add Text");
                }}
              />
              <AddButton
                icon="/Add Image Button.svg"
                text="Add Image"
                handleClick={() => {
                  console.log("Add Image");
                }}
              />
              <AddButton
                icon="/Add Video Button.svg"
                text="Add Video"
                handleClick={() => {
                  console.log("Add Video");
                }}
              />
              <AddButton
                icon="/Add Code Button.svg"
                text="Add Code"
                handleClick={() => {
                  console.log("Add Code");
                }}
              />
            </div>
            <button
              className="text-md cursor-pointer rounded-lg bg-gradient-to-br from-green-100 to-blue-200 px-4 py-2 text-page-background shadow-md transition-shadow duration-150 active:shadow-none"
              onClick={() => {
                console.log("Upload");
              }}
            >
              Upload
            </button>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

function AddButton(props: {
  icon: string;
  text: string;
  handleClick: () => void;
}) {
  return (
    <div
      className="flex cursor-pointer select-none items-center"
      onClick={props.handleClick}
    >
      <Image
        className="mr-2"
        src={props.icon}
        alt={props.icon + " icon"}
        width={24}
        height={24}
      />
      <p className="mr-6 text-sm tracking-wide text-default-text">
        {props.text}
      </p>
    </div>
  );
}

export default MakePost;
