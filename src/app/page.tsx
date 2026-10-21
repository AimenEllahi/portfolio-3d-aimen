"use client";

import dynamic from "next/dynamic";
import AboutSection from "@/components/ui/AboutSection";
import ContactSection from "@/components/ui/ContactSection";
import Navigation from "@/components/ui/Navbar";
import ProjectsSection, { type ProjectCard } from "@/components/ui/ProjectsSection";
import CarConfiguratorDemoSection from "@/components/ui/CarConfiguratorDemoSection";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import VoronoiShaderSection from "@/components/ui/VoronoiShaderSection";
import ChatComingSoon from "@/components/chat/ChatComingSoon";


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
    name: "Sticker Configurator",
    tech: ["Next.js", "Canvas", "Firebase"],
    description:
      "Upload, edit, price, and checkout custom die-cut stickers with AI background removal.",
    tag: "E-Commerce",
    tagClass:
      "border border-[var(--border-hover)] bg-[var(--accent-ghost)] text-[var(--accent)]",
    href: "https://graphics-producer-sticker-configurator.vercel.app/",
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
  {
    name: "UdS EduTech Research Platform",
    tech: ["Next.js", "React", "Tailwind"],
    description:
      "Web platform built as a Research Assistant for the EduTech group at Saarland University.",
    tag: "Full Stack",
    tagClass:
      "border border-[var(--border-hover)] bg-[var(--accent-ghost)] text-[var(--accent)]",
    href: "https://edutech.uni-saarland.de/",
  },
];

const Scene = dynamic(() => import("@/components/scene/Scene"), {
  ssr: false,
});

const HeroSection = dynamic(() => import("@/components/HeroSection"), {
  ssr: false,
  loading: () => (
    <section
      id="home"
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center gap-6 bg-black px-4 text-center"
    >
      <h1 className="font-monument text-[clamp(2.8rem,14vw,11rem)] font-bold leading-[0.95] tracking-tight text-[#b4dfd2]">AIMEN<br />QAISER</h1>
      <p className="text-xs uppercase tracking-[0.2em] text-white/75 sm:text-sm">3D Frontend Engineer · Creative Developer</p>
      <a href="#projects" className="rounded-full border border-[var(--accent)] px-5 py-2 text-sm text-[var(--accent)]">Explore Work ↓</a>
    </section>
  ),
});

export default function Home() {
  return (
    <>
      <main id="main-content" className="relative z-10 bg-transparent">
        <Scene />
        <ChatComingSoon />
        <Navigation />
        <HeroSection sectionId="home" />
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
