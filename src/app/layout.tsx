import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { WordStoreProvider } from "@/lib/word-store";
import Sidebar from "@/components/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "God Eng - 백오피스",
  description: "영어 단어 관리 백오피스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-screen flex">
        <WordStoreProvider>
          <Sidebar />
          <main className="flex-1 p-8 overflow-auto bg-gray-50">{children}</main>
        </WordStoreProvider>
      </body>
    </html>
  );
}
