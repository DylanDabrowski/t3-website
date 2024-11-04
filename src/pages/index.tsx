import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import AboutMe from "~/components/aboutme";
import BlogCard from "~/components/blogcard";
import Hero from "~/components/hero";
import { PageLayout } from "~/components/layout";
import SectionHeading from "~/components/sectionheading";
import { Spinner } from "~/components/spinner";
import Work from "~/components/work";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Dylan Dabrowski</title>
        <meta name="description" content="Personal web portfolio" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <PageLayout>
        <Hero />
        <AboutMe />
        <SectionHeading text={"Work"} />
        <Work />
        <SectionHeading text={"Blog"} />
        {postsLoading ? (
          <div className="mt-8 flex w-full flex-col items-center justify-center">
            <Spinner size={14} />
            <p className="mt-2 animate-pulse font-bold text-gray-600">
              Loading Posts ...
            </p>
          </div>
        ) : data ? (
          data.map((post) => (
            <Link href={`/post/${post.id}`} key={post.id}>
              <BlogCard
                title={post.title ? post.title : "Untitled"}
                description={
                  post.description ? post.description : "No description"
                }
                date={
                  post.createdAt
                    ? post.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""
                }
                imageUri={post.image ? post.image : ""}
              />
            </Link>
          ))
        ) : (
          <div className="mt-8 flex w-full justify-center">
            <p className="font-bold text-default-text ">Failed to load posts</p>
          </div>
        )}
      </PageLayout>
    </>
  );
};

export default Home;
