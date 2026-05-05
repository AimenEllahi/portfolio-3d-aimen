"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";



export type PreloaderProps = {
  progress: number;
  onComplete?: () => void;
  /**
   * When false, reaching 100% progress will not start the exit wipe yet
   * (wait for hero + WebGL scene to signal ready).
   */
  extrasReady?: boolean;
};

const NAME = "AIMEN QAISER";

const letterEase = [0.16, 1, 0.3, 1] as const;
const wipeEase = [0.76, 0, 0.24, 1] as const;



type IntroPhase = "aq-in" | "aq-wait" | "names";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0 },
  },
  explode: {
    transition: { staggerChildren: 0 },
  },
};

const letterVariants = {
  hidden: {
    opacity: 0,
    y: 72,
    rotateX: -55,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.8, ease: letterEase },
  },
  explode: {
    scale: 1.15,
    opacity: 0,
    transition: { duration: 0.6, ease: letterEase },
  },
};

function FilmGrain() {
  const ref = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const stride = 4;
    let w = 0;
    let h = 0;

    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      w = Math.max(1, Math.ceil(vw / stride));
      h = Math.max(1, Math.ceil(vh / stride));
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
    };

    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const g = (Math.random() * 255) | 0;
        d[i] = g;
        d[i + 1] = g;
        d[i + 2] = g;
        d[i + 3] = 20;
      }
      ctx.putImageData(img, 0, 0);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 opacity-[0.45] mix-blend-soft-light"
      style={{ imageRendering: "pixelated" }}
      aria-hidden
    />
  );
}

export default function Preloader({
  progress,
  onComplete,
  extrasReady = true,
}: PreloaderProps) {
  const [mounted, setMounted] = useState(true);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("aq-in");
  const [exitArmed, setExitArmed] = useState(false);
  const [wipeStarted, setWipeStarted] = useState(false);
  const [showScan, setShowScan] = useState(false);

  const exitSequenceStartedRef = useRef(false);
  const finishedRef = useRef(false);
  const aqEnterCompleteRef = useRef(false);
  const aqWaitTimerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const letters = NAME.split("");
  const lastLetterIndex = letters.length - 1;
  const scanDelayMs = lastLetterIndex * 0.06 * 1000 + 800 + 50;

  const p = Math.min(100, Math.max(0, progress));
  const showNameBlock = introPhase === "names";

  useEffect(() => {
    if (!showNameBlock) {
      setShowScan(false);
      return;
    }
    const t = window.setTimeout(() => setShowScan(true), scanDelayMs);
    return () => window.clearTimeout(t);
  }, [showNameBlock, scanDelayMs]);

  useEffect(() => {
    if (p < 100 || !extrasReady || exitSequenceStartedRef.current) return;
    exitSequenceStartedRef.current = true;
    const t = window.setTimeout(() => setExitArmed(true), 400);
    return () => window.clearTimeout(t);
  }, [p, extrasReady]);

  useEffect(() => {
    if (!exitArmed) return;
    const t = window.setTimeout(() => setWipeStarted(true), 600);
    return () => window.clearTimeout(t);
  }, [exitArmed]);

  useEffect(() => {
    if (!wipeStarted) return;
    const t = window.setTimeout(() => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setMounted(false);
      onCompleteRef.current?.();
      if (typeof window !== "undefined") {
        (window as Window & { __heroPreloaderComplete?: boolean }).__heroPreloaderComplete = true;
        window.dispatchEvent(new CustomEvent("hero-preloader-complete"));
      }
    }, 920);
    return () => window.clearTimeout(t);
  }, [wipeStarted]);

  useEffect(() => {
    return () => {
      if (aqWaitTimerRef.current) {
        window.clearTimeout(aqWaitTimerRef.current);
      }
    };
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden bg-black"
      style={{ zIndex: 1000 }}
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={
        wipeStarted
          ? { clipPath: "inset(0% 0% 100% 0%)" }
          : { clipPath: "inset(0% 0% 0% 0%)" }
      }
      transition={
        wipeStarted
          ? { duration: 0.9, ease: wipeEase }
          : { duration: 0 }
      }
    >
      <FilmGrain />

      <motion.div
        aria-hidden
        className="pointer-events-none fixed z-[1002] font-monument font-bold text-[var(--accent)]"
        style={{
          fontSize: "8rem",
          lineHeight: 1,
          transformOrigin: "center center",
        }}
        initial={{
          left: "50%",
          top: "50%",
          x: "-50%",
          y: "-50%",
          scale: 3,
          opacity: 0,
          filter: "blur(20px)",
        }}
        animate={
          introPhase === "names"
            ? {
                left: "max(1rem, calc((100vw - min(94vw, 72rem)) / 2 + 1rem))",
                top: "clamp(2.5rem, 5.5vw, 3.5rem)",
                x: 0,
                y: 0,
                scale: 0.19,
                opacity: 0,
                filter: "blur(0px)",
              }
            : {
                left: "50%",
                top: "50%",
                x: "-50%",
                y: "-50%",
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
              }
        }
        transition={
          introPhase === "names"
            ? { duration: 0.9, ease: letterEase }
            : { duration: 1, ease: letterEase }
        }
        onAnimationComplete={() => {
          if (aqEnterCompleteRef.current) return;
          aqEnterCompleteRef.current = true;
          setIntroPhase("aq-wait");
          aqWaitTimerRef.current = window.setTimeout(
            () => setIntroPhase("names"),
            600,
          );        }}
      >
        AQ
      </motion.div>

      <div className="relative flex h-full w-full flex-col items-center justify-center px-4">
        <div className="relative" style={{ perspective: 800 }}>
          {showNameBlock && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 origin-center -translate-x-1/2 -translate-y-1/2"
              style={{
                width: 600,
                height: 200,
                background:
                  "radial-gradient(ellipse at center, rgba(120, 80, 255, 0.12) 0%, transparent 70%)",
              }}
              initial={false}
              animate={
                exitArmed
                  ? { opacity: 0, scale: 1 }
                  : {
                      opacity: [0.4, 1],
                      scale: [0.95, 1.05],
                    }
              }
              transition={
                exitArmed
                  ? { duration: 0.4, ease: "easeOut" }
                  : {
                      duration: 3,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse",
                    }
              }
            />
          )}
          {showNameBlock && (
            <motion.div
              className="relative z-10 flex flex-wrap justify-center"
              style={{ transformStyle: "preserve-3d" }}
              variants={containerVariants}
              initial="hidden"
              animate={exitArmed ? "explode" : "visible"}
            >
              {letters.map((char, i) => (
                <motion.span
                  key={`${char}-${i}`}
                  variants={letterVariants}
                  className="inline-block select-none"
                  style={{
                    transformOrigin: "50% 50%",
                    color: "#f5f0eb",
                    fontSize: "clamp(4rem, 10vw, 9rem)",
                    lineHeight: 1,
                    fontFamily:
                      "var(--font-monument), ui-sans-serif, system-ui, sans-serif",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.div>
          )}

          {showNameBlock && showScan && !exitArmed && (
            <motion.div
              className="pointer-events-none absolute left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                boxShadow: "0 0 12px rgba(255,255,255,0.25)",
              }}
              initial={{ top: "-1px" }}
              animate={{ top: "calc(100% - 1px)" }}
              transition={{ duration: 1.2, ease: "linear" }}
            />
          )}
        </div>

        {showNameBlock && (
          <motion.p
            className="font-neue mt-10 text-center uppercase"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              color: "#f5f0eb",
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: exitArmed ? 0 : 0.4,
            }}
            transition={
              exitArmed
                ? { duration: 0.35, ease: letterEase }
                : { delay: 0.5, duration: 0.8, ease: letterEase }
            }
          >
            Crafting Visual Stories
          </motion.p>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2]">
        <div className="relative h-px w-full bg-neutral-800">
          <motion.div
            className="absolute left-0 top-0 h-full origin-left bg-white transition-[width] duration-200 ease-out"
            style={{
              width: `${exitArmed ? 100 : p}%`,
              boxShadow:
                exitArmed
                  ? "0 0 20px rgba(255,255,255,1), 0 0 12px rgba(255,255,255,0.9)"
                  : "0 0 8px rgba(255,255,255,0.85)",
            }}
            initial={false}
            animate={
              exitArmed
                ? {
                    opacity: [1, 1, 0],
                    filter: [
                      "brightness(1)",
                      "brightness(2.4)",
                      "brightness(0.3)",
                    ],
                  }
                : { opacity: 1, filter: "brightness(1)" }
            }
            transition={
              exitArmed
                ? {
                    opacity: { duration: 0.55, times: [0, 0.25, 1], ease: "easeInOut" },
                    filter: { duration: 0.55, times: [0, 0.18, 1] },
                  }
                : { duration: 0.2, ease: "easeOut" }
            }
          />
          <motion.div
            className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            style={{
              left: `${exitArmed ? 100 : p}%`,
              boxShadow: "0 0 8px white, 0 0 14px rgba(255,255,255,0.55)",
            }}
            initial={false}
            animate={
              exitArmed
                ? {
                    opacity: [1, 1, 0],
                    scale: [1, 1.35, 0.5],
                  }
                : { opacity: 1, scale: 1 }
            }
            transition={
              exitArmed
                ? {
                    duration: 0.55,
                    times: [0, 0.22, 1],
                    ease: "easeInOut",
                  }
                : { duration: 0.2, ease: "easeOut" }
            }
          />
        </div>
      </div>
    </motion.div>
  );
}
