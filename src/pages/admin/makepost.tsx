import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { updateTextareaHeight } from "~/utils/functions";
import Divider from "~/components/divider";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { ImageUploader } from "~/components/imageuploader";
import "@uiw/react-textarea-code-editor/dist.css";
import VideoUploader from "~/components/videouploader";
import { useUser } from "@clerk/clerk-react";
import { SignIn, SignInButton, SignOutButton } from "@clerk/nextjs";
import { env } from "../../env.mjs";

type Block = {
  id: string;
  type: string;
  content: string;
};

const MakePost: NextPage<{ id: string }> = ({ id }) => {
  const [image, setImage] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<
    {
      id: string;
      type: string;
      content: string;
    }[]
  >([]);

  const resetInputs = () => {
    setImage("");
    setTitle("");
    setDescription("");
    setContent([]);
  };

  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      resetInputs();
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  function addBlock(type: string) {
    if (
      type !== "text" &&
      type !== "image" &&
      type !== "video" &&
      type !== "code"
    ) {
      toast.error("Invalid block type!");
      return;
    }
    const newObject: Block = { id: uuidv4(), type: type, content: "" };
    setContent([...content, newObject]);
  }

  function updateBlockContent(newContent: string, blockId: string) {
    const newBlocks = content.map((block, i) => {
      if (block.id == blockId) {
        block.content = newContent;
        return block;
      } else {
        return block;
      }
    });
    setContent(newBlocks);
  }

  function getBlock(block: Block, type: string) {
    switch (type) {
      case "text":
        return <TextBlock block={block} handleChange={updateBlockContent} />;
      case "image":
        return <ImageBlock block={block} handleChange={updateBlockContent} />;
      case "video":
        return <VideoBlock block={block} handleChange={updateBlockContent} />;
      case "code":
        return <CodeBlock block={block} handleChange={updateBlockContent} />;

      default:
        return <ErrorBlock />;
    }
  }

  const { user, isLoaded } = useUser();

  if (!user || !isLoaded) {
    return (
      <PageLayout>
        <div className="flex w-full justify-center">
          <SignIn redirectUrl={"/admin/makepost"} />
        </div>
      </PageLayout>
    );
  } else if (user.id !== env.NEXT_PUBLIC_ADMINID) {
    return (
      <PageLayout>
        <div className="flex w-full flex-col items-center">
          <p className="mb-10 text-3xl font-bold text-default-text">
            You are not authorized to view this page.
          </p>
          <SignOutButton>
            <button className="font-bold text-default-text">Sign out</button>
          </SignOutButton>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Make a Post</title>
      </Head>
      <PageLayout>
        <div className="flex justify-between">
          <p className="text-3xl font-bold text-default-text">Make a post</p>
          <SignOutButton>
            <button className="font-bold text-default-text">Sign out</button>
          </SignOutButton>
        </div>
        <Divider space={30} />
        <ImageUploader id={uuidv4()} handleUpload={setImage} />
        <input
          type="text"
          className="w-full break-words bg-page-background text-5xl font-bold text-default-text focus:outline-none"
          placeholder="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <textarea
          className="no-scrollbar mb-12 mt-6 h-6 w-full resize-none border-none bg-page-background font-extralight text-default-text focus:outline-none"
          placeholder="Description"
          value={description}
          onChange={(e) => {
            updateTextareaHeight(e);
            setDescription(e.target.value);
          }}
        />

        <div>
          {content.map((block, index) => (
            <div key={index}>{getBlock(block, block.type)}</div>
          ))}
        </div>
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
                addBlock("text");
              }}
            />
            <AddButton
              icon="/Add Image Button.svg"
              text="Add Image"
              handleClick={() => {
                addBlock("image");
              }}
            />
            <AddButton
              icon="/Add Video Button.svg"
              text="Add Video"
              handleClick={() => {
                addBlock("video");
              }}
            />
            <AddButton
              icon="/Add Code Button.svg"
              text="Add Code"
              handleClick={() => {
                addBlock("code");
              }}
            />
          </div>
          <button
            className="text-md cursor-pointer rounded-lg bg-gradient-to-br from-green-100 to-blue-200 px-4 py-2 text-page-background shadow-md transition-shadow duration-150 active:shadow-none"
            onClick={() => {
              mutate({
                title: title,
                description: description,
                content: content,
                image: image,
              });
            }}
          >
            Upload
          </button>
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

function TextBlock(props: {
  block: Block;
  handleChange: (newContent: string, blockId: string) => void;
}) {
  return (
    <div>
      <textarea
        className="no-scrollbar my-2 w-full resize-none overflow-y-hidden rounded-xl border-2 bg-page-background p-4 font-extralight text-default-text"
        placeholder="Start typing something ..."
        onChange={(e) => {
          updateTextareaHeight(e);
          props.handleChange(e.target.value, props.block.id);
        }}
      />
    </div>
  );
}

function ImageBlock(props: {
  block: Block;
  handleChange: (newContent: string, blockId: string) => void;
}) {
  return (
    <div>
      <ImageUploader id={props.block.id} handleUpload={props.handleChange} />
    </div>
  );
}

function VideoBlock(props: {
  block: Block;
  handleChange: (newContent: string, blockId: string) => void;
}) {
  return (
    <div>
      <VideoUploader id={props.block.id} handleUpload={props.handleChange} />
    </div>
  );
}

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: false }
);

function CodeBlock(props: {
  block: Block;
  handleChange: (newContent: string, blockId: string) => void;
}) {
  const [code, setCode] = useState(`console.log("Hello World!")`);
  return (
    <div>
      <CodeEditor
        value={code}
        language="ts"
        placeholder="Please enter TS code."
        onChange={(e) => {
          setCode(e.target.value);
          props.handleChange(e.target.value, props.block.id);
        }}
        padding={15}
        style={{
          marginTop: 8,
          marginBottom: 8,
          borderRadius: 15,
          fontSize: 12,
          backgroundColor: "#222",
          color: "#fff",
          fontFamily:
            "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
        }}
      />
    </div>
  );
}

function ErrorBlock() {
  return (
    <div>
      <p>There was an error loading this block.</p>
    </div>
  );
}

export default MakePost;
