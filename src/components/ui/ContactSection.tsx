"use client";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative z-10 flex min-h-[60vh] items-center px-6 py-20"
    >
      <div className="mx-auto w-full max-w-6xl text-center">
        <h2 className="font-[var(--font-syne)] text-5xl font-bold text-white md:text-6xl lg:text-[72px]">
          Let&apos;s Build Something
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base text-gray-400">
          Open to HiWi positions, freelance projects, and research collaborations.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:aimenqaiser2000@gmail.com"
            className="rounded-full border border-cyan-300 px-6 py-3 text-sm font-semibold text-cyan-300 transition-colors hover:bg-cyan-300/10"
          >
            aimenqaiser2000@gmail.com
          </a>
          <a
            href="https://linkedin.com/in/aimen-qaiser"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-[#050508] transition-colors hover:bg-cyan-200"
          >
            LinkedIn →
          </a>
        </div>

        <a
          href="https://github.com/AimenEllahi"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          github.com/AimenEllahi
        </a>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-gray-400">
          <p>Built with Next.js · React Three Fiber · GSAP</p>
          <p className="mt-2">© 2026 Aimen Qaiser</p>
        </div>
      </div>
    </section>
  );
}
