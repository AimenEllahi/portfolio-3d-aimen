"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";
import { useLenis } from "@/components/SmoothScrollProvider";
import {
  playUiSound,
  unlockUiAudio,
} from "@/lib/uiAudio";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "Home", target: "#home" },
  { label: "Projects", target: "#projects" },
  { label: "About", target: "#about" },
  { label: "Contact", target: "#contact" },
] as const;

export default function Navbar() {
  const lenis = useLenis();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBorder, setShowBorder] = useState(false);
  const lastNavHoverSoundRef = useRef(0);

  const navHoverFeedback = () => {
    unlockUiAudio();
    const now = Date.now();
    if (now - lastNavHoverSoundRef.current < 240) return;
    lastNavHoverSoundRef.current = now;
    playUiSound("hover");
  };

  useEffect(() => {
    const onScroll = () => setShowBorder(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  const handleScrollTo = (target: string) => {
    unlockUiAudio();
    playUiSound("click");

    if (pathname !== "/") {
      router.push(`/${target}`);
      setIsMenuOpen(false);
      return;
    }

    const section = document.querySelector(target);
    if (!section) {
      window.location.hash = target;
      setIsMenuOpen(false);
      return;
    }

    if (lenis) {
      lenis.scrollTo(target);
    } else {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed left-1/2 z-[100] hidden w-[94%] -translate-x-1/2 rounded-xl border border-white/10 bg-black/30 backdrop-blur-md transition-colors [top:max(1rem,env(safe-area-inset-top,0px))] sm:w-[90%] sm:[top:max(1.5rem,env(safe-area-inset-top,0px))] lg:block ${
          showBorder ? "shadow-[0_0_0_1px_rgba(255,255,255,0.04)]" : ""
        }`}
      >
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <button
            type="button"
            data-nav-logo-anchor
            onClick={() => handleScrollTo("#home")}
            onPointerEnter={navHoverFeedback}
            className="font-monument text-xl font-bold text-[var(--accent)]"
          >
            AQ
          </button>

          <div className="flex items-center gap-8 text-sm text-white/80">
            {NAV_LINKS.map((link) => (
              <MagneticButton key={link.label} strength={0.3}>
                <button
                  type="button"
                  onClick={() => handleScrollTo(link.target)}
                  onPointerEnter={navHoverFeedback}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </button>
              </MagneticButton>
            ))}
          </div>

          <MagneticButton strength={0.5}>
            <button
              type="button"
              onClick={() => handleScrollTo("#contact")}
              onPointerEnter={navHoverFeedback}
              className="rounded-full border border-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--bg)]"
            >
              Let&apos;s Talk
            </button>
          </MagneticButton>
        </nav>
      </header>

      <header
        className={`fixed left-1/2 z-[100] w-[94%] -translate-x-1/2 rounded-xl border border-white/10 bg-black/30 backdrop-blur-md transition-colors [top:max(1rem,env(safe-area-inset-top,0px))] sm:w-[90%] sm:[top:max(1.5rem,env(safe-area-inset-top,0px))] lg:hidden ${
          showBorder ? "shadow-[0_0_0_1px_rgba(255,255,255,0.04)]" : ""
        }`}
      >
        <nav className="mx-auto flex h-14 w-full items-center justify-between px-4 sm:h-16 sm:px-6">
          <button
            type="button"
            data-nav-logo-anchor
            onClick={() => handleScrollTo("#home")}
            onPointerEnter={navHoverFeedback}
            className="font-monument text-lg font-bold text-[var(--accent)] sm:text-xl"
          >
            AQ
          </button>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-6 bg-white" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-10 bg-[rgba(5,5,8,0.97)] backdrop-blur-2xl lg:hidden"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          >
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-4 top-4 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/85 transition-colors hover:bg-white/[0.08] sm:right-6 sm:top-6"
              style={{
                top: "max(1rem, env(safe-area-inset-top, 0px))",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>

            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.label}
                type="button"
                onClick={() => handleScrollTo(link.target)}
                onPointerEnter={navHoverFeedback}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.06 * i + 0.05,
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="font-monument text-[#f0ede8] [font-size:clamp(2rem,8vw,3rem)] tracking-tight"
                style={{ touchAction: "manipulation" }}
              >
                {link.label}
              </motion.button>
            ))}

            <motion.button
              type="button"
              onClick={() => handleScrollTo("#contact")}
              onPointerEnter={navHoverFeedback}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.06 * NAV_LINKS.length + 0.1,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-2 rounded-full border border-[var(--accent)] px-7 py-3 text-base font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--bg)]"
              style={{ touchAction: "manipulation" }}
            >
              Let&apos;s Talk
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
