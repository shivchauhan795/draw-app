import type { Metadata } from "next";
import "./globals.css";
import { StateContextProvider } from "./utils/context/stateContext";
import { Caveat } from 'next/font/google'


const caveat = Caveat({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "Chat App",
  description: "Chat app by Shiv Chauhan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={caveat.className}>
      <body>
        <StateContextProvider>
          {children}
        </StateContextProvider>
      </body>
    </html>
  );
}
