"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";

const SKILLS = [
  {
    label: "Languages",
    items: ["JavaScript", "TypeScript", "CSS3", "Python"],
    className:
      "border-[rgba(110,240,200,0.25)] bg-[var(--accent-ghost)] text-[var(--accent)]",
  },
  {
    label: "Frameworks",
    items: [
      "React",
      "Next.js",
      "Angular",
      "Three.js",
      "React Three Fiber",
      "GSAP",
      "Tailwind CSS",
      "Radix UI",
    ],
    className:
      "border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.12)] text-[#c4b5fd]",
  },
  {
    label: "State & Data",
    items: ["Zustand", "React Query", "Axios", "REST APIs", "Socket.io"],
    className: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
  },
  {
    label: "Cloud, Tools & Testing",
    items: [
      "AWS",
      "Docker",
      "CI/CD",
      "Git",
      "Vite",
      "Jest",
      "Playwright",
      "Agile/Scrum",
    ],
    className: "border-amber-300/30 bg-amber-400/15 text-amber-200",
  },
];

const TIMELINE = [
  {
    company: "Think3DDD GbR",
    role: "3D Software Engineering Intern",
    year: "2026",
    location: "Berlin · Remote",
    desc:
      "Extended a Three.js medical editor with Raycaster picking and region labeling, connected the frontend to a FastAPI session API with GLTF previews, and delivered Python geometry services across 20+ REST endpoints.",
  },
  {
    company: "SAP",
    role: "Working Student, JavaScript Developer",
    year: "2025",
    location: "Walldorf, Germany",
    desc:
      "Automated end-to-end tests with qMATE and Mocha for SAP's Access Certification module (SAPUI5), using Page Object Model patterns and CI/CD integration that improved deployment efficiency by 10%.",
  },
  {
    company: "Freelance",
    role: "Frontend / Full-Stack Developer",
    year: "2022–2024",
    location: "Remote",
    desc:
      "Delivered 100+ client web applications with React, Next.js, and Three.js, plus full-stack workflows using Node.js, Express, Firebase, and MongoDB.",
  },
];

const STATS = [
  {
    number: "3",
    suffix: "+",
    label: "Years experience",
    desc: "Building production web and 3D applications",
  },
  {
    number: "10",
    suffix: "k",
    label: "Users served",
    desc: "On the DNDAI platform frontend",
  },
  {
    number: "100",
    suffix: "+",
    label: "Client projects",
    desc: "Delivered as a freelance developer",
  },
];

const VALUES = [
  {
    icon: "◈",
    title: "Performance first",
    text: "Every frame counts. Optimised for 60fps before anything else.",
  },
  {
    icon: "⟡",
    title: "Spatial thinking",
    text: "I design systems in 3D space, not just 2D interfaces.",
  },
  {
    icon: "◻",
    title: "Clean architecture",
    text: "Code that the next person can read and extend without friction.",
  },
  {
    icon: "◎",
    title: "Ship fast",
    text: "From prototype to production without losing craft.",
  },
];

const PROFILE_SRC = "/profile.jpg";

const VIEWPORT = { once: true, margin: "-12% 0px" as const };
const EASE = [0.16, 1, 0.3, 1] as const;
const SECTION_VIEWPORT = { once: true, margin: "-10% 0px" as const };

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

function SectionLabel({ number, text }: { number: string; text: string }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--subtle)]">
        {number} · {text}
      </span>
      <span className="h-[0.5px] flex-1 bg-white/[0.07]" />
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
      className="group/about-card relative isolate overflow-hidden rounded-[14px] border border-white/[0.07] bg-[var(--surface)] px-6 py-7 transition-colors duration-300 hover:border-[rgba(110,240,200,0.15)]"
      whileHover={{ y: -6 }}
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

function SectionWrap({
  children,
  last = false,
}: {
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <section
      className={`relative z-10 px-5 py-12 sm:px-8 sm:py-[60px] lg:px-12 lg:py-20 ${last ? "" : "border-b border-white/[0.05]"}`}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export default function AboutSection() {
  const [quoteImageError, setQuoteImageError] = useState(false);

  return (
    <div id="about">
      <SectionWrap>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SECTION_VIEWPORT}
          variants={staggerLeft}
          className="grid grid-cols-1 items-center gap-10 sm:grid-cols-2 sm:gap-8 lg:gap-12"
        >
          <motion.div
            variants={fadeUpItem}
            className="order-1 flex justify-center sm:order-2 sm:justify-end sm:self-start"
          >
            <div className="mb-8 sm:mb-0 sm:max-w-[180px] lg:max-w-[220px]">
              <AboutProfilePhoto />
            </div>
          </motion.div>

          <div className="order-2 sm:order-1">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={SECTION_VIEWPORT}
              transition={{ duration: 0.65, ease: EASE, delay: 0.1 }}
              className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]"
            >
              Frontend Engineer · Saarbrücken
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={SECTION_VIEWPORT}
              transition={{ duration: 0.75, ease: EASE, delay: 0.2 }}
              className="font-monument mt-4 text-[clamp(1.8rem,6vw,2.4rem)] leading-[1.05] text-[var(--fg)] sm:text-[clamp(2.2rem,5vw,3.4rem)]"
            >
              Building the web in <span className="text-[var(--accent)]">3D</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={SECTION_VIEWPORT}
              transition={{ duration: 0.75, ease: EASE, delay: 0.3 }}
              className="mt-4 max-w-[480px] text-base leading-[1.7] text-[var(--muted)]"
            >
              Frontend Engineer with 3+ years building web applications with
              React, TypeScript, and Three.js. Built the frontend for DNDAI, a
              live platform used by 10,000+ users, and worked on enterprise test
              automation at SAP. Currently developing 3D medical visualization at
              Think3DDD while pursuing MSc Media Informatics at Saarland
              University.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={SECTION_VIEWPORT}
              transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <MagneticButton strength={0.25}>
                <a
                  href="/cv.pdf"
                  download
                  className="inline-flex rounded-full bg-[var(--accent)] px-7 py-[11px] text-[13px] font-medium text-[#030d09]"
                >
                  Download CV
                </a>
              </MagneticButton>
              <button
                type="button"
                onClick={() =>
                  document
                    .querySelector("#contact")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="rounded-full border border-white/[0.12] px-7 py-[10px] text-[13px] text-[var(--muted)]"
              >
                Get in touch
              </button>
            </motion.div>
          </div>
        </motion.div>
      </SectionWrap>

      <SectionWrap>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SECTION_VIEWPORT}
          variants={staggerGrid}
        >
          <SectionLabel number="02" text="By the numbers" />
          <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                variants={{
                  hidden: { opacity: 0, y: 32, scale: 0.97 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.65, ease: EASE },
                  },
                }}
              >
                <HoverCard
                  header={
                    <div>
                      <p className="font-monument text-[clamp(2rem,8vw,2.6rem)] leading-none text-[var(--fg)] sm:text-[clamp(2.4rem,5vw,3rem)]">
                        {stat.number}
                        <span className="text-[var(--accent)]">{stat.suffix}</span>
                      </p>
                      <p className="mt-[10px] text-[10px] uppercase tracking-[0.1em] text-[var(--subtle)]">
                        {stat.label}
                      </p>
                    </div>
                  }
                >
                  <p className="mt-[6px] text-[13px] leading-[1.5] text-[var(--muted)]">
                    {stat.desc}
                  </p>
                </HoverCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </SectionWrap>

      <SectionWrap>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SECTION_VIEWPORT}
          variants={staggerLeft}
          className="grid grid-cols-1 gap-10 sm:grid-cols-[0.85fr_1.15fr] sm:gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16"
        >
          <div>
            <SectionLabel number="03" text="Experience timeline" />
            <h3 className="font-monument text-[clamp(1.8rem,3.5vw,2.4rem)] text-[var(--fg)]">
              Where I&apos;ve worked
            </h3>
            <p className="mt-3 max-w-[300px] text-[14px] leading-[1.7] text-[var(--muted)]">
              From enterprise SaaS to AI startups - each role shaped how I
              think about performance, scale, and craft.
            </p>
          </div>

          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={SECTION_VIEWPORT}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {TIMELINE.map((item, idx) => (
              <motion.li
                key={item.company}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={SECTION_VIEWPORT}
                transition={{ duration: 0.6, ease: EASE, delay: idx * 0.03 }}
                className={`grid grid-cols-[72px_1fr] gap-6 py-6 ${idx === TIMELINE.length - 1 ? "" : "border-b border-white/[0.05]"}`}
              >
                <div className="pt-1 text-right text-[12px] tracking-[0.08em] text-[var(--accent)]">
                  {item.year}
                </div>
                <motion.div
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className="flex items-start gap-3.5 rounded-lg px-2 py-1.5 hover:bg-white/[0.02]"
                >
                  <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_10px_-2px_var(--accent)]" />
                  <div>
                    <p className="text-[15px] font-medium text-[var(--fg)]">
                      {item.role}
                    </p>
                    <p className="mt-[3px] text-[13px] text-[var(--muted)]">
                      {item.company} · {item.location}
                    </p>
                    <p className="mt-[6px] text-[13px] leading-[1.6] text-[var(--subtle)]">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </SectionWrap>

      <SectionWrap>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SECTION_VIEWPORT}
          variants={staggerGrid}
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-10 lg:gap-16"
        >
          <div>
            <SectionLabel number="04" text="Skills & values" />
            <div className="space-y-7">
              {SKILLS.map((group) => (
                <div key={group.label}>
                  <p className="mb-[10px] text-[10px] uppercase tracking-[0.14em] text-[var(--subtle)]">
                    {group.label}
                  </p>
                  <motion.div
                    variants={{
                      hidden: {},
                      visible: {
                        transition: { staggerChildren: 0.04 },
                      },
                    }}
                    className="flex flex-wrap gap-2"
                  >
                    {group.items.map((item) => (
                      <motion.span
                        key={item}
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          visible: { opacity: 1, scale: 1 },
                        }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className={`rounded-full border px-[14px] py-[5px] text-[12px] ${group.className}`}
                      >
                        {item}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mt-10 sm:mt-[42px] grid grid-cols-1 gap-3 sm:grid-cols-2">
              {VALUES.map((value) => (
                <motion.div
                  key={value.title}
                  variants={fadeUpItem}
                  className="rounded-xl border border-white/[0.06] bg-[var(--surface)] p-5"
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(110,240,200,0.12)] bg-[rgba(110,240,200,0.06)] text-[14px] text-[var(--accent)]">
                    {value.icon}
                  </div>
                  <p className="text-[13px] font-medium text-[var(--fg)]">
                    {value.title}
                  </p>
                  <p className="mt-1 text-[12px] leading-[1.6] text-[var(--subtle)]">
                    {value.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </SectionWrap>

      <SectionWrap last>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={SECTION_VIEWPORT}
          transition={{ duration: 1, ease: EASE }}
          className="mx-auto max-w-[720px]"
        >
          <SectionLabel number="05" text="Philosophy" />
          <span
            aria-hidden
            className="mb-5 block font-serif text-[72px] leading-[0.6] text-[var(--accent)] opacity-30"
            style={{ fontFamily: "Georgia, serif" }}
          >
            &quot;
          </span>
          <p className="text-[clamp(1.2rem,2.5vw,1.5rem)] leading-[1.6] text-[var(--fg)]">
            3D web is where technical graphics engineering and thoughtful UX
            design create the most meaningful work. I build things that make
            people stop and look twice.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[var(--surface)]">
              {quoteImageError ? (
                <span className="text-[11px] font-medium text-[var(--fg)]">AQ</span>
              ) : (
                <Image
                  src={PROFILE_SRC}
                  alt="Aimen Qaiser"
                  width={36}
                  height={36}
                  onError={() => setQuoteImageError(true)}
                  className="h-9 w-9 object-cover"
                />
              )}
            </div>
            <div>
              <p className="text-[13px] font-medium text-[var(--fg)]">
                Aimen Qaiser
              </p>
              <p className="text-[12px] text-[var(--subtle)]">
                Frontend Engineer · MSc Media Informatics
              </p>
            </div>
          </motion.div>
        </motion.div>
      </SectionWrap>
    </div>
  );
}
