import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";
import CursorGlow from "@/components/ui/CursorGlow";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "Aimen Qaiser — 3D Frontend Engineer",
  description:
    "Frontend Engineer specializing in immersive 3D web experiences, React Three Fiber, and interactive configurators.",
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
    <html
      lang="en"
      className={`dark h-full overflow-x-hidden ${spaceGrotesk.variable} ${syne.variable}`}
    >
      <body
        className="h-full overflow-x-hidden antialiased bg-[#050508] text-white font-[var(--font-space-grotesk)]"
      >
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}
