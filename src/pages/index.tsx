import { SignIn } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { toast } from "react-hot-toast";
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-900">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <SignIn />
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
          </button>
          <Image
            className="animate-[wiggle_0.5s_ease-in-out_infinite]"
            src={"/wave3.png"}
            width={150}
            height={150}
            alt={"wave"}
          />
          <div className="-translate-x-full transform transition-transform hover:translate-x-0">
            <Image
              className="animate-[wiggle_0.5s_ease-in-out_infinite]"
              src={"/wave3.png"}
              width={150}
              height={150}
              alt={"wave"}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
