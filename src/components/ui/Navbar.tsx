"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";
import { useLenis } from "@/components/SmoothScrollProvider";
import {
  playUiSound,
  unlockUiAudio,
} from "@/lib/uiAudio";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Home", target: "#home" },
  { label: "Projects", target: "#projects" },
  { label: "About", target: "#about" },
  { label: "Contact", target: "#contact" },
] as const;

const easeInOutSine = (progress: number) =>
  -(Math.cos(Math.PI * progress) - 1) / 2;

export default function Navbar() {
  const lenis = useLenis();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBorder, setShowBorder] = useState(false);
  const lastNavHoverSoundRef = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
      if (e.key !== "Tab") return;
      const controls = menuRef.current?.querySelectorAll<HTMLElement>("a, button");
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      menuButton?.focus();
    };
  }, [isMenuOpen]);

  const handleScrollTo = (target: string, event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    unlockUiAudio();
    playUiSound("click");
    if (pathname !== "/") {
      setIsMenuOpen(false);
      return;
    }
    event.preventDefault();
    const section = document.querySelector(target);
    if (!section) {
      window.location.hash = target;
      setIsMenuOpen(false);
      return;
    }
    history.pushState(null, "", target);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lenis) {
      const distanceInViewports = Math.abs(section.getBoundingClientRect().top) / window.innerHeight;
      const duration = Math.min(2.4, Math.max(1.1, distanceInViewports * 0.75));
      lenis.scrollTo(target, {
        immediate: reduceMotion,
        duration,
        easing: easeInOutSine,
      });
    } else {
      section.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth" });
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
          <a
            href="/#home"
            data-nav-logo-anchor
            onClick={(event) => handleScrollTo("#home", event)}
            onPointerEnter={navHoverFeedback}
            className="font-monument text-xl font-bold text-[var(--accent)]"
          >
            AQ
          </a>

          <div className="flex items-center gap-8 text-sm text-white/80">
            {NAV_LINKS.map((link) => (
              <MagneticButton key={link.label} strength={0.3}>
                <a
                  href={`/${link.target}`}
                  onClick={(event) => handleScrollTo(link.target, event)}
                  onPointerEnter={navHoverFeedback}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </MagneticButton>
            ))}
          </div>

          <MagneticButton strength={0.5}>
            <a
              href="/#contact"
              onClick={(event) => handleScrollTo("#contact", event)}
              onPointerEnter={navHoverFeedback}
              className="rounded-full border border-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--bg)]"
            >
              Let&apos;s Talk
            </a>
          </MagneticButton>
        </nav>
      </header>

      <header
        className={`fixed left-1/2 z-[100] w-[94%] -translate-x-1/2 rounded-xl border border-white/10 bg-black/30 backdrop-blur-md transition-colors [top:max(1rem,env(safe-area-inset-top,0px))] sm:w-[90%] sm:[top:max(1.5rem,env(safe-area-inset-top,0px))] lg:hidden ${
          showBorder ? "shadow-[0_0_0_1px_rgba(255,255,255,0.04)]" : ""
        }`}
      >
        <nav className="mx-auto flex h-14 w-full items-center justify-between px-4 sm:h-16 sm:px-6">
          <a
            href="/#home"
            data-nav-logo-anchor
            onClick={(event) => handleScrollTo("#home", event)}
            onPointerEnter={navHoverFeedback}
            className="font-monument text-lg font-bold text-[var(--accent)] sm:text-xl"
          >
            AQ
          </a>

          <button
            ref={menuButtonRef}
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
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
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
              <motion.a
                key={link.label}
                href={`/${link.target}`}
                onClick={(event) => handleScrollTo(link.target, event)}
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
              </motion.a>
            ))}

            <motion.a
              href="/#contact"
              onClick={(event) => handleScrollTo("#contact", event)}
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
            </motion.a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
