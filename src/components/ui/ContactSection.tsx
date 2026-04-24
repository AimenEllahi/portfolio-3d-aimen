"use client";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative z-10 flex min-h-[60vh] items-center px-4 sm:px-6 py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl text-center">
        <h2 className="font-[var(--font-syne)] text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-[72px]">
          Let&apos;s Build Something
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base text-[var(--gray)]">
          Open to HiWi positions, freelance projects, and research collaborations.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href="mailto:aimenqaiser2000@gmail.com"
            className="w-full sm:w-auto rounded-full border border-[var(--cyan)] px-6 py-3 text-sm font-semibold text-[var(--cyan)] transition-colors hover:bg-[var(--cyan)]/10"
          >
            Email Me
          </a>
          <a
            href="https://linkedin.com/in/aimen-qaiser"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto rounded-full bg-[var(--cyan)] px-6 py-3 text-sm font-semibold text-[var(--bg)] transition-colors hover:brightness-95"
          >
            LinkedIn →
          </a>
        </div>

        <a
          href="https://github.com/AimenEllahi"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex text-sm text-[var(--cyan)] hover:brightness-110 transition-colors"
        >
          github.com/AimenEllahi
        </a>

        <div className="mt-10 sm:mt-12 border-t border-white/10 pt-6 text-sm text-[var(--gray)]">
          <p>Built with Next.js · React Three Fiber · GSAP</p>
          <p className="mt-2">© 2026 Aimen Qaiser</p>
        </div>
      </div>
    </section>
  );
}
