import type { Metadata } from "next";
import { Cinzel, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Waloński Kodex — Walloon Codex",
  description: "Identify regional Sudeten minerals and explore the legendary history of the Walloons.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Poszukiwacz",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0c0c0c] text-[#ededed]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
