import type { Metadata, Viewport } from "next";
import { Montserrat, Roboto_Condensed } from "next/font/google";
import "./globals.css";

const robotoCondensed = Roboto_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sensaciones · Cuban Cuisine · Fort Myers",
  description:
    "Sensaciones Restaurant digital menu — authentic Cuban cuisine in Fort Myers, FL.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2E413D",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${robotoCondensed.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
