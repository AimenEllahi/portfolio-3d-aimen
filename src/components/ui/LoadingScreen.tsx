"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { gsap } from "gsap";

export default function LoadingScreen() {
  const { progress } = useProgress();
  const [hidden, setHidden] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasFadedRef = useRef(false);

  useEffect(() => {
    if (progress < 100 || !wrapperRef.current || hasFadedRef.current) return;
    hasFadedRef.current = true;

    gsap.to(wrapperRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => setHidden(true),
    });
  }, [progress]);

  if (hidden) return null;

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black"
    >
      <div className="font-[var(--font-syne)] text-4xl font-bold text-cyan-300">AQ</div>
      <div className="mt-5 h-[2px] w-44 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full bg-cyan-300 transition-[width] duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
