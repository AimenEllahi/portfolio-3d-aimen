"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";

export type UseMagneticOptions = {
  /** Pull strength applied to `delta * strength` (default 0.4) */
  strength?: number;
};

export function useMagnetic<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options?: UseMagneticOptions,
) {
  const strength = options?.strength ?? 0.4;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const halfW = rect.width * 0.75;
      const halfH = rect.height * 0.75;
      const inField =
        e.clientX >= centerX - halfW &&
        e.clientX <= centerX + halfW &&
        e.clientY >= centerY - halfH &&
        e.clientY <= centerY + halfH;

      if (!inField) return;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      gsap.to(el, {
        x: deltaX * strength,
        y: deltaY * strength,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [ref, strength]);

  return { ref };
}
