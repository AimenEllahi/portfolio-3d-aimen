"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/components/shared/SmoothScroll";
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

  useEffect(() => {
    const onScroll = () => setShowBorder(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollTo = (target: string) => {
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
        className={`fixed top-4 sm:top-6 left-1/2 w-[94%] sm:w-[90%] -translate-x-1/2 rounded-xl z-50 bg-black/30 backdrop-blur-md border border-white/10 transition-colors ${
          showBorder ? "shadow-[0_0_0_1px_rgba(255,255,255,0.04)]" : ""
        }`}
      >
        <nav className="mx-auto flex h-14 sm:h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => handleScrollTo("#home")}
            className="text-lg sm:text-xl font-bold text-[var(--cyan)] font-[var(--font-syne)]"
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
              className="rounded-full border border-[var(--cyan)] px-4 py-2 text-sm font-medium text-[var(--cyan)] transition-colors hover:bg-[var(--cyan)] hover:text-[var(--bg)]"
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
            className="mt-2 rounded-full border border-[var(--cyan)] px-6 py-2 text-base font-medium text-[var(--cyan)] transition-colors hover:bg-[var(--cyan)] hover:text-[var(--bg)]"
          >
            Let&apos;s Talk
          </button>
        </div>
      ) : null}
    </>
  );
}
