"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCursor } from "../CustomCursor";
import { div } from "framer-motion/client";


export default function ChatComingSoon() {

   const [open, setOpen] = useState(false);
   const panelRef = useRef<HTMLDivElement>(null);
   const  {setHovering} = useCursor();

   useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
   }, [open]);

   // Close on click outside
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

    return (
        <div ref={panelRef}
        className="fixed z-[70] flex flex-col items-end gap-3"
        style={{
          right: "max(1rem, env(safe-area-inset-right, 0px))",
          bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
        }}>
            <AnimatePresence>
  {open && (
    <motion.div
      key="chat-teaser"
      role="status"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[var(--surface)]/95 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md"
    >
      <p className="font-monument text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
        AI Assistant
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--fg)]">
        Ask about my work, projects, and experience — launching soon.
      </p>
      <p className="mt-2 text-xs text-[var(--muted)]">
        For now, reach me via the contact section or email.
      </p>
    </motion.div>
  )}
</AnimatePresence>

<button
  type="button"
  aria-expanded={open}
  aria-label={open ? "Close assistant preview" : "Open assistant preview"}
  onClick={() => setOpen((v) => !v)}
  onMouseEnter={() => setHovering(true)}
  onMouseLeave={() => setHovering(false)}
  className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-[var(--accent)]/35 bg-black/50 text-[var(--accent)] shadow-[0_0_32px_-8px_rgba(110,240,200,0.45)] backdrop-blur-md transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98]"
>
  {/* Chat icon */}
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M12 3c-4.4 0-8 3.1-8 7 0 2.2 1.2 4.2 3.2 5.4L6 21l4.2-2.2c.5.1 1 .1 1.8.1 4.4 0 8-3.1 8-7s-3.6-7-8-7z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>

  {/* Lock / soon badge */}
  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-[var(--bg)] text-[8px] font-medium uppercase tracking-wider text-white/70">
    soon
  </span>

  {/* Subtle pulse ring */}
  <span
    aria-hidden
    className="pointer-events-none absolute inset-0 rounded-full border border-[var(--accent)]/25 motion-safe:animate-ping opacity-30"
  />
</button>
        </div>
    );
}




