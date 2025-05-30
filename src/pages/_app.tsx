import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Chatbot } from "../components/Chatbot";
import "../index.css";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <Chatbot />
    </SessionProvider>
  );
}

export default MyApp; 