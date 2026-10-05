"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        className={`${geistSans.variable} ${geistMono.variable} overflow-y-scroll antialiased`}
      >
        <div className="flex min-h-screen flex-col items-center bg-stone-200 sm:p-8">
          {children}
        </div>
      </body>
    </html>
  );
};
