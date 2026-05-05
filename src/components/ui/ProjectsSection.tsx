"use client";

import type { CSSProperties } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  playUiSound,
  unlockUiAudio,
} from "@/lib/uiAudio";

gsap.registerPlugin(ScrollTrigger);

export type ProjectCard = {
  name: string;
  tech: string[];
  description: string;
  tag: string;
  tagClass: string;
  href: string;
};

type ProjectsSectionProps = {
  projects: ProjectCard[];
};

const CARD_W = 438;
const CARD_H = 256;
const GAP = 18;
const SECTION_MAX_INNER = 1104;
const MIN_CARD_DRAW = 236;

const STACK_ROT = [0, 1.5, -1, 2, -1.2, 1.3] as const;

const STACK_STEP_Y = 3;
const STAGE_PAD_Y = 12;
/** Gap (px) from bottom of stacked cards to reveal cue — unrelated to `--deck-spread` min-height reserve. */
const CTA_GAP_BELOW_STACK = 14;

function stackRotFor(i: number) {
  return STACK_ROT[i % STACK_ROT.length];
}

/** Vertical position (px) of row-0 card centre relative to deck top. */
function deckAnchorCenterY(): number {
  return STAGE_PAD_Y + CARD_H / 2;
}

function estimateDeckInnerFromViewport(vw: number): number {
  const gutter = vw >= 640 ? 48 : 32;
  return Math.max(280, Math.min(SECTION_MAX_INNER, vw - gutter));
}

function cardWidthForDeck(deckInnerW: number): number {
  return Math.min(CARD_W, Math.max(MIN_CARD_DRAW, deckInnerW - 16));
}

function preferTwoColumnSpread(
  deckInnerW: number,
  cardW: number,
  count: number,
): boolean {
  if (count <= 1) return false;
  return deckInnerW + 6 >= cardW * 2 + GAP;
}

function computeSpreadLayout(deckInnerW: number, count: number) {
  const cw = cardWidthForDeck(deckInnerW);
  const twoCol = preferTwoColumnSpread(deckInnerW, cw, count);
  const stepY = CARD_H + GAP;

  if (count <= 0) {
    return { cw, twoCol, finals: [] as { x: number; y: number }[] };
  }

  if (!twoCol) {
    return {
      cw,
      twoCol,
      finals: Array.from({ length: count }, (_, i) => ({
        x: 0,
        y: i * stepY,
      })),
    };
  }

  const cols = 2;
  const rows = Math.ceil(count / cols);
  const gridW = cols * cw + (cols - 1) * GAP;
  const cellW = cw + GAP;

  const finals: { x: number; y: number }[] = [];
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (i >= count) break;
      const x = -gridW / 2 + cw / 2 + c * cellW;
      const y = r * stepY;
      finals.push({ x, y });
      i++;
    }
  }
  return { cw, twoCol, finals };
}

function spreadReserveMinHeightPx(deckInnerW: number, count: number): number {
  const bottomPad = 28;
  const { twoCol } = computeSpreadLayout(deckInnerW, count);
  const rows =
    count <= 0 ? 0 : twoCol ? Math.ceil(count / 2) : count;
  const gridPx = CARD_H * rows + GAP * Math.max(0, rows - 1);
  return STAGE_PAD_Y + gridPx + bottomPad;
}

function stackedCueTopForDeckSize(nCards: number, deckInnerW: number): number {
  const base =
    STAGE_PAD_Y +
    CARD_H +
    Math.max(0, nCards - 1) * STACK_STEP_Y +
    CTA_GAP_BELOW_STACK;
  const reserve = spreadReserveMinHeightPx(deckInnerW, nCards);
  return Math.min(
    base,
    Math.max(STAGE_PAD_Y + CARD_H, reserve - 100),
  );
}

function staggerForDeckWidth(inner: number): number {
  return inner < 420 ? 0.2 : inner < 900 ? 0.24 : 0.28;
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const deckRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const dealDoneRef = useRef(false);
  const triggerSpreadRef = useRef<(() => void) | null>(null);
  const lastHoverSoundRef = useRef(0);
  const [ctaHidden, setCtaHidden] = useState(false);
  /** True after GSAP deal motion settles — hover uses full “hover” chime; stacked uses softer pulse. */
  const [dealSettled, setDealSettled] = useState(false);
  const n = projects.length;
  const [deckInnerW, setDeckInnerW] = useState(() =>
    typeof window !== "undefined"
      ? estimateDeckInnerFromViewport(window.innerWidth)
      : SECTION_MAX_INNER,
  );

  const spreadReservePx = spreadReserveMinHeightPx(deckInnerW, n);
  const stackedCueTopPx = stackedCueTopForDeckSize(n, deckInnerW);

  useLayoutEffect(() => {
    dealDoneRef.current = false;
  }, [projects]);

  useLayoutEffect(() => {
    const measureDeck = () => {
      const el = deckRef.current;
      const w =
        el?.getBoundingClientRect().width ??
        estimateDeckInnerFromViewport(window.innerWidth);
      setDeckInnerW(w);
    };
    measureDeck();
    window.addEventListener("resize", measureDeck);
    return () => window.removeEventListener("resize", measureDeck);
  }, []);

  useEffect(() => {
    setCtaHidden(false);
    setDealSettled(false);
  }, [projects]);

  const onCardPointerEnter = () => {
    unlockUiAudio();
    const now = Date.now();
    if (now - lastHoverSoundRef.current < 180) return;
    lastHoverSoundRef.current = now;
    playUiSound(dealSettled ? "hover" : "progressPulse");
  };

  const handleSpreadClick = () => {
    unlockUiAudio();
    playUiSound("click");
    const fn = triggerSpreadRef.current;
    if (!fn || dealDoneRef.current) return;
    setCtaHidden(true);
    fn();
  };

  useLayoutEffect(() => {
    const deck = deckRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (!deck || cards.length !== n) return;

    const applyStackTransforms = () => {
      const innerW = deck.getBoundingClientRect().width;
      const { cw } = computeSpreadLayout(innerW, n);
      const ay = deckAnchorCenterY();
      projects.forEach((_, i) => {
        const el = cards[i];
        gsap.set(el, {
          transformPerspective: 1100,
          position: "absolute",
          left: "50%",
          top: ay,
          width: cw,
          height: CARD_H,
          marginLeft: -cw / 2,
          marginTop: -CARD_H / 2,
          x: i * STACK_STEP_Y,
          y: i * STACK_STEP_Y,
          rotation: stackRotFor(i),
          rotationY: 0,
          zIndex: n - i,
        });
      });
    };

    const applySettledTransforms = () => {
      const innerW = deck.getBoundingClientRect().width;
      const { cw, finals } = computeSpreadLayout(innerW, n);
      const ay = deckAnchorCenterY();
      projects.forEach((_, i) => {
        const el = cards[i];
        const f = finals[i];
        if (!f) return;
        gsap.set(el, {
          marginLeft: -cw / 2,
          marginTop: -CARD_H / 2,
          top: ay,
          left: "50%",
          width: cw,
          x: f.x + i * STACK_STEP_Y,
          y: f.y + i * STACK_STEP_Y,
          rotation: 0,
          rotationY: 0,
          zIndex: 10 + i,
        });
      });
    };

    applyStackTransforms();

    let breatheTween: gsap.core.Tween | null = gsap.to(deck, {
      y: 10,
      duration: 2.9,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    let expandLayoutDelayed: gsap.core.Tween | null = null;

    const runDealAnimations = () => {
      breatheTween?.kill();
      breatheTween = null;
      gsap.killTweensOf(deck);
      gsap.set(deck, { clearProps: "y" });
      dealDoneRef.current = true;

      const innerW = deck.getBoundingClientRect().width;
      const { finals } = computeSpreadLayout(innerW, n);

      const stagger = staggerForDeckWidth(innerW);
      const moveDuration = 0.95;

      expandLayoutDelayed?.kill();
      const settleDelay =
        stagger * Math.max(0, n - 1) + moveDuration + 0.06;
      expandLayoutDelayed = gsap.delayedCall(settleDelay, () => {
        expandLayoutDelayed = null;
        setDealSettled(true);
      });

      projects.forEach((_, i) => {
        const card = cards[i];
        const f = finals[i];
        if (!f) return;
        const t0 = i * stagger;
        gsap.to(card, {
          x: f.x + i * STACK_STEP_Y,
          y: f.y + i * STACK_STEP_Y,
          rotation: 0,
          rotationY: 0,
          zIndex: 10 + i,
          duration: moveDuration,
          delay: t0,
          ease: "expo.out",
        });
      });
    };

    const triggerSpread = () => {
      if (dealDoneRef.current) return;
      playUiSound("deal");
      runDealAnimations();
    };

    triggerSpreadRef.current = triggerSpread;

    const onResize = () => {
      ScrollTrigger.refresh();
      if (!dealDoneRef.current) {
        applyStackTransforms();
      } else {
        applySettledTransforms();
      }
    };

    window.addEventListener("resize", onResize);
    return () => {
      expandLayoutDelayed?.kill();
      triggerSpreadRef.current = null;
      breatheTween?.kill();
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf(cards);
      gsap.killTweensOf(deck);
    };
  }, [projects, n]);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [projects, dealSettled, spreadReservePx, deckInnerW]);

  const deckVarsSpread = {
    "--deck-spread": `${spreadReservePx}px`,
  } as CSSProperties;

  return (
    <section
      id="projects"
      className="relative z-10 border-t border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-[2px]"
      style={{ perspective: "1200px" }}
    >
      <div className="mx-auto flex w-full max-w-[1104px] flex-col px-4 pt-12 pb-20 sm:px-6 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28">
        <motion.header
          className="mb-5 max-w-xl sm:mb-6 lg:mb-7"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
            02 / Work
          </p>
          <h2 className="font-monument text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl lg:text-[2.5rem]">
            Selected Work
          </h2>
          <p className="font-neue mt-3 text-[0.9rem] leading-relaxed text-gray-400">
            A few things I&apos;ve built recently
          </p>
          <div className="mt-4 h-px w-20 bg-[var(--accent)]" />
        </motion.header>

        <div className="relative mx-auto flex w-full flex-col">
          <div
            ref={deckRef}
            className="relative mx-auto w-full min-h-[var(--deck-spread)]"
            style={deckVarsSpread}
          >
            {projects.map((project, i) => (
              <motion.article
                key={`${project.name}-${i}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                onPointerEnter={onCardPointerEnter}
                data-project-card
                variants={{ rest: {}, hover: {} }}
                initial="rest"
                whileHover="hover"
                className="group/card absolute isolate overflow-hidden rounded-2xl"
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.6)",
                  background:
                    "linear-gradient(135deg, #0d0d0d 0%, #111118 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <div
                  className={`pointer-events-none absolute left-0 right-0 top-0 z-20 h-0.5 origin-left scale-x-0 transition-transform duration-[400ms] ease-out group-hover/card:scale-x-100 ${
                    project.tag === "Frontend"
                      ? "bg-[var(--amber)]"
                      : "bg-[var(--accent)]"
                  }`}
                />

                <div className="relative flex h-full flex-col p-5 transition-[transform,box-shadow] duration-300 ease-out group-hover/card:-translate-y-3 group-hover/card:shadow-[0_24px_72px_-16px_rgba(0,0,0,0.55)]">
                  <div className="pointer-events-none absolute right-3 top-2 font-monument text-[3.5rem] leading-none text-white/[0.15]">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div className="relative z-[1] flex items-start justify-between gap-4 pr-14 sm:pr-16">
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${project.tagClass}`}
                    >
                      {project.tag}
                    </span>
                  </div>

                  <h3 className="font-monument relative z-[1] mt-4 text-[clamp(1.15rem,calc(0.35rem+4.2vw),1.6rem)] leading-[1.12] text-white">
                    {project.name}
                  </h3>

                  <div className="relative z-[1] mt-4 flex flex-wrap gap-2">
                    {project.tech.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[var(--border)] bg-[var(--surface-2)]/50 px-2.5 py-1 text-xs text-[var(--muted)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <motion.div
                    className="relative z-[1] mt-auto flex flex-col gap-2 pb-1 pt-5"
                    variants={{
                      rest: { opacity: 0, y: 10 },
                      hover: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.2 },
                      },
                    }}
                  >
                    <p className="text-[0.85rem] leading-relaxed text-gray-400">
                      {project.description}
                    </p>
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[0.9rem] font-medium text-[var(--accent)] hover:text-[var(--accent-dim)]"
                    >
                      Live Demo →
                    </a>
                  </motion.div>
                </div>
              </motion.article>
            ))}

            {n > 0 && !ctaHidden ? (
              <div
                className="pointer-events-none absolute inset-x-0 z-[30] flex justify-center pb-2"
                style={{ top: stackedCueTopPx }}
              >
                <button
                  type="button"
                  onClick={handleSpreadClick}
                  className="group pointer-events-auto flex flex-col items-center gap-2 rounded-xl px-2 py-2 text-[var(--accent)] transition-[opacity,transform] duration-200 hover:opacity-[0.95] active:scale-[0.98]"
                  aria-label="Reveal projects — click to expand the deck"
                >
                  <motion.span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent)]/55 bg-black/35 text-[var(--accent)] shadow-[0_0_22px_-6px_rgba(129,237,217,0.45)] backdrop-blur-sm md:h-10 md:w-10"
                    animate={{ y: [0, 5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.5,
                      ease: "easeInOut",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 7v13M7 13l5 7 5-7" />
                    </svg>
                  </motion.span>
                  <span className="font-neue max-w-[16rem] text-center text-[0.74rem] font-medium uppercase leading-snug tracking-[0.24em] text-white/62 transition-colors duration-200 group-hover:text-white/88 md:text-[0.78rem] md:tracking-[0.26em]">
                    Click to reveal projects
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
