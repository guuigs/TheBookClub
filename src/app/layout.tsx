import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mediamoure = localFont({
  src: [
    {
      path: "../fonts/mediamoure-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/mediamoure-regularitalic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-mediamoure",
});

export const metadata: Metadata = {
  title: "The Book Club",
  description: "Votre communauté de lecteurs passionnés",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${manrope.variable} ${mediamoure.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
