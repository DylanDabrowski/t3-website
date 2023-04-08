import React from "react";
import { NextPage } from "next";
import { api } from "~/utils/api";
import Head from "next/head";
import { PageLayout } from "~/components/layout";

const Post: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({
    id,
  });

  if (!data) return <div>404</div>;

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
        <div className="flex h-full w-full flex-col items-center justify-center">
          {data.description}
        </div>
      </PageLayout>
    </>
  );
};

export default Post;
