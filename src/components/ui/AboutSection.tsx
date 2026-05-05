"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const SKILLS = [
  {
    label: "3D / WebGL",
    items: ["Three.js", "React Three Fiber", "WebGL", "GSAP"],
    className:
      "border-[rgba(110,240,200,0.25)] bg-[var(--accent-ghost)] text-[var(--accent)]",
  },
  {
    label: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind"],
    className:
      "border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.12)] text-[#c4b5fd]",
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

const PROFILE_SRC = "/profile.jpg";

const VIEWPORT = { once: true, margin: "-12% 0px" as const };
const EASE = [0.16, 1, 0.3, 1] as const;

const staggerGrid = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.05 },
  },
};

const staggerLeft = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.11, delayChildren: 0 },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: EASE },
  },
};

function AboutProfilePhoto() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="group/photo relative mx-auto aspect-[4/5] w-full max-w-[220px] shrink-0 cursor-pointer select-none overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.75)] transition-[border-color,box-shadow,transform] duration-300 hover:border-[var(--accent)]/35 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.99] motion-safe:focus-within:border-[var(--accent)]/40 motion-safe:focus-within:shadow-[0_0_56px_-20px_var(--accent-ghost)] sm:mx-0"
      tabIndex={0}
      aria-label="Profile photo — hover or press and hold to sharpen"
    >
      <Image
        src={PROFILE_SRC}
        alt="Aimen Qaiser"
        fill
        draggable={false}
        sizes="(max-width: 640px) 70vw, 220px"
        className={`object-cover scale-[1.04] blur-2xl motion-reduce:blur-none motion-reduce:scale-105 group-hover/photo:blur-none group-hover/photo:scale-105 group-active/photo:blur-none group-active/photo:scale-105 group-focus-visible/photo:blur-none ${
          reduceMotion ? "" : "motion-safe:transition-[filter,transform] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
        }`}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.06] group-hover/photo:ring-[var(--accent)]/30"
      />
      <p className="pointer-events-none absolute bottom-3 left-2 right-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-white/70 drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)] transition-opacity duration-300 [@media(hover:hover)]:group-hover/photo:opacity-0 group-active/photo:opacity-0 motion-reduce:opacity-0 sm:text-[11px]">
        Hover to reveal
      </p>
      <span className="pointer-events-none absolute left-3 top-3 text-[9px] uppercase tracking-[0.16em] text-white/45 opacity-95 [@media(hover:hover)]:hidden sm:text-[10px]">
        Tap &amp; hold
      </span>
    </div>
  );
}

function HoverCard({
  accentClass,
  header,
  children,
}: {
  accentClass?: string;
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="group/about-card relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)] p-5 sm:p-6 transition-colors duration-300 hover:border-white/[0.14]"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <div
        className={`pointer-events-none absolute left-0 right-0 top-0 z-10 h-px origin-left scale-x-0 transition-transform duration-500 ease-out group-hover/about-card:scale-x-100 ${accentClass ?? "bg-[var(--accent)]"}`}
      />
      {header}
      {children}
    </motion.div>
  );
}

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative z-10 flex min-h-screen items-center px-4 py-16 sm:px-6 sm:py-20"
    >
      <motion.div
        className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-5"
        variants={staggerGrid}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
      >
        <motion.div variants={staggerLeft} className="lg:col-span-3">
          <motion.h2
            variants={fadeUpItem}
            className="font-monument text-4xl font-bold text-white sm:text-5xl"
          >
            About Me
          </motion.h2>

          <motion.div
            variants={fadeUpItem}
            className="mt-6 flex flex-col gap-6 sm:flex-row sm:gap-8"
          >
            <AboutProfilePhoto />
            <div className="min-w-0 flex-1 space-y-5">
              <p className="max-w-3xl text-base leading-relaxed text-gray-300">
                Frontend Engineer with 3+ years building high-performance 3D web
                applications. Currently pursuing MSc Media Informatics at Saarland
                University and interning at Think3DDD in Berlin doing medical 3D
                visualization. Previously at SAP and led frontend at DNDAI serving
                10,000+ users.
              </p>
              <p className="max-w-3xl text-base leading-relaxed text-gray-400">
                I enjoy turning complex spatial systems into experiences that still
                feel intuitive and fast. For me, 3D web is where technical graphics
                engineering and thoughtful UX design create the most meaningful work.
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUpItem}
          className="flex flex-col gap-6 lg:col-span-2"
        >
          <HoverCard
            header={
              <h3 className="font-monument text-xl font-semibold text-white">
                Skills
              </h3>
            }
          >
            <div className="mt-5 space-y-5">
              {SKILLS.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-xs uppercase tracking-[0.14em] text-gray-400">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <motion.span
                        key={item}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{
                          type: "spring",
                          stiffness: 480,
                          damping: 22,
                        }}
                        className={`rounded-full border px-2.5 py-1 text-xs ${group.className}`}
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </HoverCard>

          <HoverCard
            accentClass="bg-gradient-to-r from-[var(--accent)] to-amber-500"
            header={
              <h3 className="font-monument text-xl font-semibold text-white">
                Experience
              </h3>
            }
          >
            <ul className="mt-5 space-y-3">
              {TIMELINE.map((item) => (
                <motion.li
                  key={item.company}
                  whileHover={{
                    x: 5,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 26,
                    },
                  }}
                  className="flex cursor-default gap-3 rounded-xl border border-transparent px-2 py-1.5 transition-colors hover:border-white/[0.06] hover:bg-white/[0.025]"
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_12px_-2px_var(--accent)]" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{item.company}</p>
                    <p className="text-sm text-gray-400">{item.role}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-sm text-[var(--accent)] tabular-nums">
                    {item.year}
                  </span>
                </motion.li>
              ))}
            </ul>
          </HoverCard>
        </motion.div>
      </motion.div>
    </section>
  );
}
