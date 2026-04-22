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
    <div ref={containerRef} className="relative z-10 flex min-h-screen items-center px-6 pt-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <p
            data-hero-animate
            className="mb-6 text-xs uppercase tracking-[0.24em] text-[#6ee7f7]"
          >
            Frontend Engineer · Three.js · TypeScript
          </p>

          <h1
            data-hero-animate
            className="font-[var(--font-syne)] text-5xl font-extrabold leading-[0.95] text-white md:text-7xl lg:text-[96px]"
          >
            <span className="block">Building</span>
            <span className="block bg-gradient-to-r from-cyan-300 to-purple-500 bg-clip-text text-transparent">
              Immersive
            </span>
            <span className="block">Experiences</span>
          </h1>

          <p data-hero-animate className="mt-8 max-w-2xl text-base text-gray-400">
            3+ years crafting 3D web applications, interactive configurators, and
            real-time rendering systems.
          </p>

          <div data-hero-animate className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-[#050508] transition-colors hover:bg-cyan-200"
            >
              View Projects →
            </a>
            <a
              href="/configurator"
              className="rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#050508]"
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
