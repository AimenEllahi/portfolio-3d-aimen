"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

const ITEMS = [
  { text: "THREE.JS", type: "tech" },
  { text: "Creative Development", type: "role" },
  { text: "NEXT.JS", type: "tech" },
  { text: "WebGL Shaders", type: "role" },
  { text: "GSAP", type: "tech" },
  { text: "3D Web Experiences", type: "role" },
  { text: "REACT THREE FIBER", type: "tech" },
  { text: "Motion Design", type: "role" },
  { text: "TYPESCRIPT", type: "tech" },
  { text: "Spatial Interfaces", type: "role" },
  { text: "GLSL", type: "tech" },
  { text: "Product Configurators", type: "role" },
] as const;

function Separator() {
  return (
    <span
      aria-hidden
      className="mx-6 inline-block h-1 w-1 rounded-full bg-[var(--accent)] opacity-40 align-middle"
      style={{ verticalAlign: "middle", flexShrink: 0 }}
    />
  );
}

function MarqueeRow({
  items,
  direction = 1,
  speed = 38,
}: {
  items: readonly { text: string; type: "tech" | "role" }[];
  direction?: 1 | -1;
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const clone = track.children[0] as HTMLElement | undefined;
    if (!clone) return;

    const itemW = clone.offsetWidth;
    if (!itemW) return;

    gsap.set(track, { x: direction === -1 ? -itemW : 0 });

    tweenRef.current = gsap.to(track, {
      x: direction === 1 ? -itemW : 0,
      duration: itemW / speed,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => {
          const val = parseFloat(x);
          if (direction === 1) return val <= -itemW ? val + itemW : val;
          return val >= 0 ? val - itemW : val;
        }),
      },
    });

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) tweenRef.current.pause();

    const onEnter = () =>
      gsap.to(tweenRef.current, {
        timeScale: 0.25,
        duration: 0.5,
        ease: "power2.out",
      });

    const onLeave = () =>
      gsap.to(tweenRef.current, {
        timeScale: 1,
        duration: 0.5,
        ease: "power2.out",
      });

    track.parentElement?.addEventListener("mouseenter", onEnter);
    track.parentElement?.addEventListener("mouseleave", onLeave);

    return () => {
      tweenRef.current?.kill();
      track.parentElement?.removeEventListener("mouseenter", onEnter);
      track.parentElement?.removeEventListener("mouseleave", onLeave);
    };
  }, [direction, speed]);

  const repeated = [...items, ...items, ...items];

  return (
    <div className="w-full overflow-hidden" aria-hidden>
      <div ref={trackRef} className="flex items-center will-change-transform">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {repeated.map((item, i) => (
              <span key={`${copy}-${i}`} className="flex shrink-0 items-center">
                <span
                  className={`inline-block shrink-0 whitespace-nowrap font-monument text-[0.65rem] tracking-[0.18em] uppercase sm:text-[0.72rem] ${
                    item.type === "tech"
                      ? "text-[var(--accent)] opacity-80"
                      : "text-white/30"
                  }`}
                >
                  {item.text}
                </span>
                <Separator />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarqueeStrip() {
  return (
    <div
      className="relative z-10 w-full overflow-hidden border-y border-white/[0.05] bg-[var(--bg)]/80 backdrop-blur-sm"
      aria-label="Technology stack"
    >
      <div className="border-b border-white/[0.04] py-3 sm:py-4">
        <MarqueeRow items={ITEMS} direction={1} speed={36} />
      </div>

      <div className="py-3 sm:py-4">
        <MarqueeRow
          items={[...ITEMS.slice(6), ...ITEMS.slice(0, 6)]}
          direction={-1}
          speed={28}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-32"
        style={{
          background:
            "linear-gradient(to right, var(--bg) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-32"
        style={{
          background:
            "linear-gradient(to left, var(--bg) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
