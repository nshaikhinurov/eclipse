"use client";

import type { Metadata } from "next";
import { Manrope, WindSong } from "next/font/google";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const windSong = WindSong({
  variable: "--font-windsong",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eclipse",
  description:
    "Use your reasoning skills to harmonize the grid with a symbol in every cell.",
};

export const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body
        className={`${manrope.variable} ${windSong.variable} overflow-y-scroll antialiased`}
      >
        <div className="flex min-h-screen flex-col items-center px-4 pt-[22px] pb-[60px]">
          {children}
        </div>
      </body>
    </html>
  );
};
