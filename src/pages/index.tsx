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
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const ctx = api.useContext();
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
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

  return (
    <>
      <Head>
        <title>Dylan Dabrowski</title>
        <meta name="description" content="Personal web portfolio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <Hero />
        <AboutMe />
        <Link href={""}>
          <BlogCard
            title={"Working with Threejs"}
            description={
              "Making a 3D scene in Threejs, for a web portfolio with a twist."
            }
            date={""}
            imageUri={""}
          />
        </Link>
        {/* <SignIn />
          <SignOutButton />
          <button
            onClick={() =>
              mutate({
                title: "Hello World!",
                description: "hello there world",
                content: JSON.stringify({
                  type: "text",
                  content: "i love coding!",
                }),
              })
            }
          >
            Post
          </button> */}
      </PageLayout>
    </>
  );
};

export default Home;
