import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import ConditionalBackground from "@/components/ConditionalBackground";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "3D Portfolio | Creative Developer",
  description:
    "Interactive 3D portfolio showcasing creative development, Three.js expertise, and modern web experiences.",
  keywords: [
    "3D developer",
    "Three.js",
    "React Three Fiber",
    "Next.js",
    "Portfolio",
    "Web Developer",
  ],
  authors: [{ name: "Creative Developer" }],
  openGraph: {
    title: "3D Portfolio | Creative Developer",
    description:
      "Interactive 3D portfolio showcasing creative development and modern web experiences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-white min-h-screen overflow-x-hidden`}
      >
        {/* Conditional background - switcher on home, particles on other pages */}
        <ConditionalBackground />

        {/* Responsive header/navigation */}
        <Header />

        {/* Main content area */}
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
