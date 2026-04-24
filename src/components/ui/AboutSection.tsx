"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SKILLS = [
  {
    label: "3D / WebGL",
    items: ["Three.js", "React Three Fiber", "WebGL", "GSAP"],
    className: "border-cyan-300/30 bg-cyan-400/15 text-cyan-200",
  },
  {
    label: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind"],
    className: "border-purple-300/30 bg-purple-400/15 text-purple-200",
  },
  {
    label: "Backend",
    items: ["Node.js", "Python", "REST APIs"],
    className: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
  },
];

const TIMELINE = [
  {
    company: "Think3DDD",
    role: "3D Software Engineering Intern",
    year: "2026",
  },
  { company: "SAP", role: "JavaScript Developer", year: "2025" },
  {
    company: "DNDAI",
    role: "Lead Frontend Engineer",
    year: "2024",
  },
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-about-left]",
        { opacity: 0, x: -80 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );

      gsap.fromTo(
        "[data-about-right]",
        { opacity: 0, x: 80 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: "power3.out",
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
      id="about"
      ref={sectionRef}
      className="relative z-10 flex min-h-screen items-center px-4 sm:px-6 py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-5">
          <div data-about-left className="lg:col-span-3">
            <h2 className="font-[var(--font-syne)] text-4xl sm:text-5xl font-bold text-white">
              About Me
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-gray-300">
              Frontend Engineer with 3+ years building high-performance 3D web
              applications. Currently pursuing MSc Media Informatics at Saarland
              University and interning at Think3DDD in Berlin doing medical 3D
              visualization. Previously at SAP and led frontend at DNDAI serving
              10,000+ users.
            </p>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-400">
              I enjoy turning complex spatial systems into experiences that still
              feel intuitive and fast. For me, 3D web is where technical graphics
              engineering and thoughtful UX design create the most meaningful work.
            </p>
          </div>

          <div data-about-right className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5 sm:p-6">
              <h3 className="font-[var(--font-syne)] text-xl font-semibold text-white">
                Skills
              </h3>
              <div className="mt-5 space-y-5">
                {SKILLS.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-xs uppercase tracking-[0.14em] text-gray-400">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className={`rounded-full border px-2.5 py-1 text-xs ${group.className}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[var(--surface)] p-5 sm:p-6">
              <h3 className="font-[var(--font-syne)] text-xl font-semibold text-white">
                Experience
              </h3>
              <ul className="mt-5 space-y-4">
                {TIMELINE.map((item) => (
                  <li key={item.company} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--cyan)]" />
                    <div>
                      <p className="text-sm font-medium text-white">{item.company}</p>
                      <p className="text-sm text-gray-400">{item.role}</p>
                    </div>
                    <span className="ml-auto text-sm text-[var(--cyan)]">{item.year}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
