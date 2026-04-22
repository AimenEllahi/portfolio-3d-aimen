"use client";

import { useEffect, useRef, useState } from "react";

export default function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updateTargetProgress = () => {
      const scrollTop = window.scrollY;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      targetProgressRef.current = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
    };

    const animate = () => {
      smoothProgressRef.current +=
        (targetProgressRef.current - smoothProgressRef.current) * 0.15;
      setProgress(smoothProgressRef.current);
      rafRef.current = window.requestAnimationFrame(animate);
    };

    updateTargetProgress();
    rafRef.current = window.requestAnimationFrame(animate);
    window.addEventListener("scroll", updateTargetProgress, { passive: true });
    window.addEventListener("resize", updateTargetProgress);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("scroll", updateTargetProgress);
      window.removeEventListener("resize", updateTargetProgress);
    };
  }, []);

  return progress;
}
