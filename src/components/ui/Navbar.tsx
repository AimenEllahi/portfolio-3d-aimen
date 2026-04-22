"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/components/shared/SmoothScroll";

const NAV_LINKS = [
  { label: "Home", target: "#hero" },
  { label: "Projects", target: "#projects" },
  { label: "About", target: "#about" },
  { label: "Contact", target: "#contact" },
] as const;

export default function Navbar() {
  const lenis = useLenis();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBorder, setShowBorder] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBorder(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollTo = (target: string) => {
    if (lenis) {
      lenis.scrollTo(target);
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-10 left-1/2 w-[90%] -translate-x-1/2 rounded-lg z-50 bg-black/20 backdrop-blur-md transition-colors ${
          showBorder ? "border-b border-white/10" : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-0">
          <button
            type="button"
            onClick={() => handleScrollTo("#hero")}
            className="text-xl font-bold text-[#6ee7f7] font-[var(--font-syne)]"
          >
            AQ
          </button>

          <div className="hidden items-center gap-8 text-sm text-white/80 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleScrollTo(link.target)}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:block">
            <button
              type="button"
              onClick={() => handleScrollTo("#contact")}
              className="rounded-full border border-[#6ee7f7] px-4 py-2 text-sm font-medium text-[#6ee7f7] transition-colors hover:bg-[#6ee7f7] hover:text-black"
            >
              Let&apos;s Talk
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex flex-col gap-1.5 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-6 bg-white" />
          </button>
        </nav>
      </header>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-black/95 md:hidden">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => handleScrollTo(link.target)}
              className="text-2xl font-semibold text-white"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleScrollTo("#contact")}
            className="mt-2 rounded-full border border-[#6ee7f7] px-6 py-2 text-base font-medium text-[#6ee7f7] transition-colors hover:bg-[#6ee7f7] hover:text-black"
          >
            Let&apos;s Talk
          </button>
        </div>
      ) : null}
    </>
  );
}
