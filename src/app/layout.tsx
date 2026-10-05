import type { Metadata, Viewport } from "next";
import { RootLayout } from "~/fsd/app/root-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eclipse",
  description:
    "Use your reasoning skills to harmonize the grid with a symbol in every cell.",
  applicationName: "Eclipse",
  appleWebApp: {
    capable: true,
    title: "Eclipse",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#262159",
  viewportFit: "cover",
};

export default RootLayout;
