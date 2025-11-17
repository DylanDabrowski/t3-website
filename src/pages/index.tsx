import { type NextPage } from "next";
import Head from "next/head";
import AboutMe from "~/components/aboutme";
import Hero from "~/components/hero";
import { PageLayout } from "~/components/layout";
import Work from "~/components/work";

const Home: NextPage = () => {
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
        <Work />
      </PageLayout>
    </>
  );
};

export default Home;
