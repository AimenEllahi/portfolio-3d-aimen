"use client";

import { useEffect } from "react";

export default function CursorGlow() {
  useEffect(() => {
    const cursor = document.getElementById("cursor-glow");
    if (!cursor || window.matchMedia("(pointer: coarse)").matches) return;

    let tx = window.innerWidth * 0.5;
    let ty = window.innerHeight * 0.5;
    let x = tx;
    let y = ty;
    let rafId = 0;

    const animate = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      cursor.style.transform = `translate3d(${x - 6}px, ${y - 6}px, 0)`;
      rafId = window.requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("a, button, [role='button'], input, textarea, select")) {
        cursor.classList.add("cursor-glow--active");
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("a, button, [role='button'], input, textarea, select")) {
        cursor.classList.remove("cursor-glow--active");
      }
    };

    rafId = window.requestAnimationFrame(animate);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseout", onOut, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
    };
  }, []);

  return <div id="cursor-glow" className="cursor-glow" aria-hidden />;
}
