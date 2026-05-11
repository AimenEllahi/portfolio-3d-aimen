"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import CustomCursor from "@/components/CustomCursor";
import Preloader from "@/components/Preloader";
import AboutSection from "@/components/ui/AboutSection";
import ContactSection from "@/components/ui/ContactSection";
import Navigation from "@/components/ui/Navbar";
import ProjectsSection, { type ProjectCard } from "@/components/ui/ProjectsSection";
import CarConfiguratorDemoSection from "@/components/ui/CarConfiguratorDemoSection";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import VoronoiShaderSection from "@/components/ui/VoronoiShaderSection";

const PROJECTS_DATA: ProjectCard[] = [
  {
    name: "DNDAI Platform",
    tech: ["Next.js", "Node.js", "MongoDB"],
    description:
      "AI-powered platform scaling gameplay sessions for a live user base.",
    tag: "Full Stack",
    tagClass:
      "border border-[var(--border-hover)] bg-[var(--accent-ghost)] text-[var(--accent)]",
    href: "https://dndai.app/",
  },
  {
    name: "Xiaomi 3D Showcase",
    tech: ["Three.js", "Next.js", "GSAP"],
    description: "Product storytelling with real-time WebGL and scroll FX.",
    tag: "3D Web",
    tagClass:
      "border border-[var(--border-hover)] bg-[var(--accent-ghost)] text-[var(--accent)]",
    href: "https://o16u.vercel.app/",
  },
  {
    name: "Boat Configurator",
    tech: ["R3F", "Next.js", "Tailwind"],
    description:
      "Real-time configurators with water shading and UX polish.",
    tag: "3D UX",
    tagClass:
      "border border-[var(--border-hover)] bg-[var(--accent-ghost)] text-[var(--accent)]",
    href: "https://landau-alure-232.vercel.app/Island",
  },
  {
    name: "TaskBoard Pro",
    tech: ["Angular", "Tailwind"],
    description: "Sprint dashboards, filters, and responsive task grids.",
    tag: "Frontend",
    tagClass:
      "border border-[color:rgba(245,158,11,0.28)] bg-[color:rgba(245,158,11,0.1)] text-[var(--amber)]",
    href: "https://angular-project-ashy.vercel.app/dashboard",
  },
];

const Scene = dynamic(() => import("@/components/scene/Scene"), {
  ssr: false,
});

const HeroSection = dynamic(() => import("@/components/HeroSection"), {
  ssr: false,
  loading: () => (
    <section
      className="relative min-h-[100dvh] w-full bg-black"
      aria-hidden
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        <p className="font-neue text-xs uppercase tracking-[0.35em] text-white/35">
          Loading
        </p>
      </div>
    </section>
  ),
});

/** First paint stabilised — replaces video metadata preload for progress bar */
function layoutPaintReady(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export default function Home() {
  const [baselineProgress, setBaselineProgress] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  const progress = useMemo(
    () =>
      Math.min(
        100,
        Math.round(
          baselineProgress * 0.7 + (heroReady ? 15 : 0) + (sceneReady ? 15 : 0),
        ),
      ),
    [baselineProgress, heroReady, sceneReady],
  );

  const extrasReady = heroReady && sceneReady;

  useEffect(() => {
    const failSafe = window.setTimeout(() => {
      setHeroReady(true);
      setSceneReady(true);
    }, 12000);
    return () => window.clearTimeout(failSafe);
  }, []);

  useEffect(() => {
    let cancelled = false;

    let completed = 0;
    const total = 3;

    const bump = () => {
      if (cancelled) return;
      completed += 1;
      setBaselineProgress(Math.min(100, (completed / total) * 100));
    };

    void Promise.all([
      document.fonts.ready.then(() => bump()).catch(() => bump()),
      layoutPaintReady().then(() => bump()),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, 2000);
      }).then(() => bump()),
    ]).finally(() => {
      if (!cancelled) setBaselineProgress(100);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {showPreloader ? (
        <Preloader
          progress={progress}
          extrasReady={extrasReady}
          onComplete={() => setShowPreloader(false)}
        />
      ) : null}
      <Scene onReady={() => setSceneReady(true)} />
      <main className="relative z-10 bg-transparent">
        <Navigation />
        <CustomCursor />
        <HeroSection sectionId="home" onHeroReady={() => setHeroReady(true)} />
        <MarqueeStrip />
        <ProjectsSection projects={PROJECTS_DATA} />
        <CarConfiguratorDemoSection />
        <VoronoiShaderSection />
        <AboutSection />
        <ContactSection />
      </main>
    </>
  );
}
