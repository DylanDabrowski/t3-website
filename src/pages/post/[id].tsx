import React, { useEffect } from "react";
import { GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";
import Head from "next/head";
import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { Post } from "@prisma/client";
import Image from "next/image";
import Divider from "~/components/divider";
import BackButton from "../../assets/back-button.svg";

type Block = {
  id: string;
  type: string;
  content: string;
};

const Post: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getById.useQuery<Post>({
    id,
  });

  useEffect(() => {
    console.log(data);
  }, [data]);

  if (!data) return <div>404</div>;

  function getBlock(type: string, content: string) {
    switch (type) {
      case "text":
        return <TextBlock content={content} />;
      case "image":
        return <ImageBlock content={content} />;
      case "video":
        return <VideoBlock content={content} />;
      case "code":
        return <CodeBlock content={content} />;

      default:
        return <ErrorBlock />;
    }
  }

  return (
    <>
      <Head>
        <title>{`${data.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })} - ${data.title}`}</title>
      </Head>
      <PageLayout>
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center">
            <Link href="/" className="">
              <Image
                className="mr-6"
                src={"/back-button.svg"}
                alt="back button"
                width={35}
                height={35}
              />
            </Link>
            <h1 className="text-3xl font-bold text-default-text">
              {data.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h1>
          </div>
          <Divider space={20} />
          <h1 className="text-5xl font-bold text-default-text">{data.title}</h1>
          <h2 className="mt-6 font-extralight text-default-text">
            {data.description}
          </h2>
          {data.image ? (
            <Image
              className="mt-4 max-h-96 object-contain"
              src={data.image}
              alt="cover image"
              width={1440}
              height={1440}
            />
          ) : (
            <></>
          )}
          <Divider space={20} />
          {data.content ? (
            data.content.map((block: Block) => (
              <div key={block.id} className="my-4">
                {getBlock(block.type, block.content)}
              </div>
            ))
          ) : (
            <p>Loading</p>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.posts.getById.prefetch({ id });

  return {
    props: { trpcState: ssg.dehydrate(), id },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

function TextBlock(props: { content: string }) {
  return (
    <div>
      <p className="text-xl text-default-text">{props.content}</p>
    </div>
  );
}

function ImageBlock(props: { content: string }) {
  return (
    <div className="flex justify-center">
      <Image
        className="max-w-full"
        src={props.content}
        alt={props.content}
        width={1440}
        height={1440}
      />
    </div>
  );
}

function VideoBlock(props: { content: string }) {
  return (
    <div className="flex justify-center">
      <video className="max-w-full" src={props.content} controls></video>
    </div>
  );
}

import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import dark from "../../styles/syntaxTheme";
import Link from "next/link";

function CodeBlock(props: { content: string }) {
  return (
    <div>
      <SyntaxHighlighter style={dark} language={"typescript"}>
        {props.content}
      </SyntaxHighlighter>
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

export default Post;
