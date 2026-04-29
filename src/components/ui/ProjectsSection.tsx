"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Project = {
  name: string;
  tech: string[];
  description: string;
  impact: string;
  tag: string;
  tagClass: string;
  href: string;
};

const PROJECTS = [
  {
    name: "DNDAI Platform",
    tech: ["Next.js", "Node.js", "MongoDB"],
    description: "AI-powered platform serving 10,000+ users",
    impact: "Scaled gameplay sessions and content generation for a growing active user base.",
    tag: "Full Stack",
    tagClass: "bg-emerald-400/20 text-emerald-300 border-emerald-300/30",
    href: "https://dndai.app/",
  },
  {
    name: "Xiaomi Interactive Showcase",
    tech: ["Three.js", "Next.js", "GSAP"],
    description:
      "Interactive 3D product showcase for Redmi 12 with real-time rendering",
    impact: "Improved product storytelling with immersive interactions and smooth visual performance.",
    tag: "3D Web",
    tagClass: "bg-cyan-400/20 text-cyan-300 border-cyan-300/30",
    href: "https://o16u.vercel.app/",
  },
  {
    name: "Landau Boat Configurator",
    tech: ["Three.js", "Next.js", "Tailwind", "GSAP"],
    description: "Real-time 3D boat customization with realistic water rendering",
    impact: "Reduced sales friction by letting users preview custom configurations instantly.",
    tag: "Configurator",
    tagClass: "bg-purple-400/20 text-purple-300 border-purple-300/30",
    href: "https://landau-alure-232.vercel.app/Island",
  },
  {
    name: "TaskBoard Pro Dashboard",
    tech: ["Angular", "Tailwind CSS"],
    description: "Simple task dashboard with filters, status tracking, and sprint overview.",
    impact: "Improved day-to-day task visibility with a clean, responsive Angular UI.",
    tag: "Frontend",
    tagClass: "bg-cyan-400/20 text-cyan-300 border-cyan-300/30",
    href: "https://angular-project-ashy.vercel.app/dashboard",
  },
] satisfies Project[];

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-project-card]",
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative z-10 flex min-h-screen items-center px-4 sm:px-6 py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[var(--cyan)]">
            02 / Work
          </p>
          <h2 className="font-[var(--font-syne)] text-3xl sm:text-4xl font-bold text-white">
            Selected Work
          </h2>
          <div className="mt-3 h-px w-20 bg-[var(--cyan)]" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PROJECTS.map((project) => (
            <article
              key={project.name}
              data-project-card
              className="group flex min-h-[320px] flex-col rounded-2xl border border-white/10 bg-[var(--surface)] p-5 sm:p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--cyan)]"
            >
              <div
                className={`mb-5 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${project.tagClass}`}
              >
                {project.tag}
              </div>

              <h3 className="font-[var(--font-syne)] text-3xl font-semibold leading-tight text-white">
                {project.name}
              </h3>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-gray-300"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-sm text-gray-400">{project.description}</p>
              <p className="mt-3 text-sm text-gray-300">{project.impact}</p>

              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex pt-6 text-sm font-medium text-[var(--cyan)] transition-colors group-hover:brightness-110"
              >
                Live Demo →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
