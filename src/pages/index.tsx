import { SignIn, SignOutButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import AboutMe from "~/components/aboutme";
import BlogCard from "~/components/blogcard";
import Hero from "~/components/hero";
import { PageLayout } from "~/components/layout";
import SectionHeading from "~/components/sectionheading";
import Work from "~/components/work";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const ctx = api.useContext();
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
          <p>Loading</p>
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
          <p>Failed to load posts</p>
        )}
      </PageLayout>
    </>
  );
};

export default Home;
