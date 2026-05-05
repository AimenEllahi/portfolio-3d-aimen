"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { create } from "zustand";

type CursorStore = {
  isHovering: boolean;
  setHovering: (value: boolean) => void;
};

export const useCursorStore = create<CursorStore>((set) => ({
  isHovering: false,
  setHovering: (isHovering) => set({ isHovering }),
}));

export function useCursor() {
  const setHovering = useCursorStore((s) => s.setHovering);
  return { setHovering };
}

export default function CustomCursor() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return;

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    const tick = () => {
      const { x: mx, y: my } = mouseRef.current;
      const { x: rx, y: ry } = ringPosRef.current;
      const lerp = 0.12;
      ringPosRef.current = {
        x: rx + (mx - rx) * lerp,
        y: ry + (my - ry) * lerp,
      };

      const dot = dotRef.current;
      const ring = ringRef.current;
      const hovering = useCursorStore.getState().isHovering;
      const scale = hovering ? 3 : 1;

      if (dot) {
        dot.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;
      }
      if (ring) {
        const { x: rxx, y: ryy } = ringPosRef.current;
        ring.style.transform = `translate3d(${rxx - 20}px, ${ryy - 20}px, 0) scale(${scale})`;
        ring.style.mixBlendMode = hovering ? "difference" : "normal";
        ring.style.backgroundColor = hovering ? "#ffffff" : "transparent";
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const attached = new Map<
      Element,
      { enter: () => void; leave: () => void }
    >();

    const refreshTargets = () => {
      attached.forEach(({ enter, leave }, el) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
      attached.clear();

      document.querySelectorAll("a, button").forEach((node) => {
        const enter = () => useCursorStore.getState().setHovering(true);
        const leave = () => useCursorStore.getState().setHovering(false);
        node.addEventListener("mouseenter", enter);
        node.addEventListener("mouseleave", leave);
        attached.set(node, { enter, leave });
      });
    };

    refreshTargets();

    let t = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(refreshTargets, 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(t);
      observer.disconnect();
      attached.forEach(({ enter, leave }, el) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
      attached.clear();
    };
  }, [mounted, pathname]);

  if (!mounted) return null;
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 rounded-full bg-[var(--fg)] shadow-[0_0_6px_rgba(255,255,255,0.35)]"
        style={{
          width: 8,
          height: 8,
          zIndex: 9999,
          transform: "translate3d(-100px,-100px,0)",
          willChange: "transform",
        }}
      />
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 rounded-full border"
        style={{
          width: 40,
          height: 40,
          boxSizing: "border-box",
          borderColor: "rgba(240, 240, 240, 0.45)",
          zIndex: 9999,
          transform: "translate3d(-100px,-100px,0)",
          transformOrigin: "50% 50%",
          transition: "background-color 160ms ease, mix-blend-mode 160ms ease",
          willChange: "transform",
        }}
      />
    </>
  );
}
