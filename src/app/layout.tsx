import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "lenis/dist/lenis.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";

const neue = DM_Sans({
  subsets: ["latin"],
  variable: "--font-neue",
  display: "swap",
  weight: ["400", "500", "700"],
});

const monument = Syne({
  subsets: ["latin"],
  variable: "--font-monument",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
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
  authors: [{ name: "Aimen Qaiser" }],
  openGraph: {
    title: "Aimen Qaiser — 3D Frontend Engineer",
    description:
      "Frontend Engineer specializing in immersive 3D web experiences, React Three Fiber, and interactive configurators.",
    type: "website",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark min-h-[100dvh] overflow-x-hidden ${neue.variable} ${monument.variable}`}
    >
      <body className="min-h-[100dvh] overflow-x-hidden antialiased bg-[var(--bg)] text-[var(--fg)] font-neue">
        <Script
          id="scroll-restoration-top"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if('scrollRestoration'in history)history.scrollRestoration='manual';window.scrollTo(0,0);}catch(e){}})();`,
          }}
        />
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
