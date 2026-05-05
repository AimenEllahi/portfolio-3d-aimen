"use client";

import { useEffect, useRef } from "react";

const MAIL = "aimenqaiser2000@gmail.com";

function MagneticMailCta() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const posRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const arena = arenaRef.current;
    const link = linkRef.current;
    if (!arena || !link) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      const p = posRef.current;
      p.x = lerp(p.x, p.tx, 0.14);
      p.y = lerp(p.y, p.ty, 0.14);
      link.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = arena.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const mag = 0.38;
      posRef.current.tx =
        ((e.clientX - cx) / Math.max(1, r.width / 2)) * 28 * mag;
      posRef.current.ty =
        ((e.clientY - cy) / Math.max(1, r.height / 2)) * 20 * mag;
    };

    const reset = () => {
      posRef.current.tx = 0;
      posRef.current.ty = 0;
    };

    rafRef.current = requestAnimationFrame(tick);
    arena.addEventListener("pointermove", onMove);
    arena.addEventListener("pointerleave", reset);

    return () => {
      cancelAnimationFrame(rafRef.current);
      arena.removeEventListener("pointermove", onMove);
      arena.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <div
      ref={arenaRef}
      className="relative mx-auto mt-10 flex min-h-[160px] w-full max-w-xl items-center justify-center p-8"
    >
      <a
        ref={linkRef}
        href={`mailto:${MAIL}`}
        className="inline-flex min-w-[min(100%,280px)] items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[var(--accent)]/10 px-10 py-4 text-center text-base font-semibold text-[var(--accent)] shadow-[0_0_0_1px_rgba(110,240,200,0.12)] transition-[background-color,box-shadow] duration-300 hover:bg-[var(--accent)]/18 hover:shadow-[0_20px_60px_-24px_var(--accent-ghost)] sm:text-lg"
        style={{ willChange: "transform" }}
      >
        Compose email
      </a>
    </div>
  );
}

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative z-10 flex min-h-[70vh] items-center px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto w-full max-w-4xl text-center">
        <h2 className="font-monument text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Let&apos;s Work Together
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Open to HiWi roles, freelance, and collaborations—especially 3D web and
          product UI.
        </p>

        <MagneticMailCta />

        <p className="mt-4">
          <a
            href={`mailto:${MAIL}`}
            className="font-neue text-sm text-gray-400 transition-colors hover:text-[var(--accent)]"
          >
            {MAIL}
          </a>
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://linkedin.com/in/aimen-qaiser"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] min-w-[148px] items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-[var(--bg)] transition-colors hover:brightness-95"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/AimenEllahi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] min-w-[148px] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/[0.07]"
          >
            GitHub
          </a>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-xs text-[var(--muted)] sm:text-sm">
          <p>Built with Next.js · React Three Fiber · GSAP</p>
          <p className="mt-2">© 2026 Aimen Qaiser</p>
        </div>
      </div>
    </section>
  );
}
