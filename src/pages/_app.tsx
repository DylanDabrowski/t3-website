import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { Toaster } from "react-hot-toast";

import "~/styles/globals.css";
import { setupAWS } from "~/utils/s3";

const MyApp: AppType = ({ Component, pageProps }) => {
  if (typeof window === "undefined") {
    // Only call setupAWS on the server-side
    setupAWS();
  }

  return (
    <ClerkProvider {...pageProps}>
      <Toaster position="top-center" />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
