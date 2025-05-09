import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/header";
import BottomNavigationWrapper from "@/components/nav/bottom-nav-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - Nestter",
    default: "Nestter",
  },
  description: "Classic Twitter is back!",
};

export const runtime = 'edge';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="font-[family-name:var(--font-geist-sans)]">
          <Header />
          <main className="pb-12 lg:pb-0">
            {children}
          </main>
          <div className="w-screen lg:hidden">
            <BottomNavigationWrapper />
          </div>
        </div>
      </body>
    </html>
  );
}
