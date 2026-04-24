"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function HeroText() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-animate]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.2,
          ease: "power3.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex min-h-screen items-center px-4 sm:px-6 pt-24 sm:pt-20"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <p
            data-hero-animate
            className="mb-6 text-[11px] sm:text-xs uppercase tracking-[0.24em] text-[var(--cyan)]"
          >
            Frontend Engineer · Three.js · TypeScript
          </p>

          <h1
            data-hero-animate
            className="font-[var(--font-syne)] text-4xl font-extrabold leading-[0.95] text-white sm:text-5xl md:text-7xl lg:text-[96px]"
          >
            <span className="block">Building</span>
            <span className="block bg-gradient-to-r from-[var(--cyan)] to-[var(--purple)] bg-clip-text text-transparent">
              Immersive
            </span>
            <span className="block">Experiences</span>
          </h1>

          <p data-hero-animate className="mt-6 sm:mt-8 max-w-2xl text-sm sm:text-base text-[var(--gray)]">
            3+ years crafting 3D web applications, interactive configurators, and
            real-time rendering systems.
          </p>

          <div data-hero-animate className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="#projects"
              className="rounded-full bg-[var(--cyan)] px-5 sm:px-6 py-3 text-sm font-semibold text-[var(--bg)] transition-colors hover:brightness-95"
            >
              View Projects →
            </a>
            <a
              href="/configurator"
              className="rounded-full border border-white/80 px-5 sm:px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[var(--bg)]"
            >
              Try Configurator
            </a>
          </div>

          <p data-hero-animate className="mt-10 text-sm text-white/70 animate-bounce">
            Scroll to explore ↓
          </p>
        </div>
      </div>
    </div>
  );
}
