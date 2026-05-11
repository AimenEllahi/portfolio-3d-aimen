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


const letterEase = [0.16, 1, 0.3, 1] as const;
const wipeEase = [0.76, 0, 0.24, 1] as const;



type IntroPhase = "aq-in" | "aq-wait" | "names";

/** Animation timing knobs — slowed slightly so the intro reads as
 *  deliberate rather than rushed. */
const AQ_ENTER_MS = 1100;
const AQ_WAIT_MS = 700;
const AQ_FLYOUT_MS = 1000;
const LETTER_DURATION_S = 0.9;
const SCAN_DURATION_S = 1.4;
const POST_SCAN_HOLD_MS = 350;

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
  const [aqLogoTarget, setAqLogoTarget] = useState<{ x: number; y: number }>({
    x: 72,
    y: 56,
  });
  /** Becomes true once the scan-line has finished sweeping AND a small
   *  hold has elapsed. We refuse to start the exit wipe before this so
   *  the intro never gets cut off mid-animation. */
  const [introAnimationComplete, setIntroAnimationComplete] = useState(false);

  const exitSequenceStartedRef = useRef(false);
  const finishedRef = useRef(false);
  const aqEnterCompleteRef = useRef(false);
  const aqWaitTimerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const scanDelayMs =
    LETTER_DURATION_S * 1000 + 50;

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
    if (!showScan) return;
    const t = window.setTimeout(
      () => setIntroAnimationComplete(true),
      SCAN_DURATION_S * 1000 + POST_SCAN_HOLD_MS,
    );
    return () => window.clearTimeout(t);
  }, [showScan]);

  useEffect(() => {
    if (
      p < 100 ||
      !extrasReady ||
      !introAnimationComplete ||
      exitSequenceStartedRef.current
    )
      return;
    exitSequenceStartedRef.current = true;
    const t = window.setTimeout(() => setExitArmed(true), 400);
    return () => window.clearTimeout(t);
  }, [p, extrasReady, introAnimationComplete]);

  useEffect(() => {
    if (!exitArmed) return;
    const t = window.setTimeout(() => setWipeStarted(true), 700);
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
    }, 1080);
    return () => window.clearTimeout(t);
  }, [wipeStarted]);

  useEffect(() => {
    return () => {
      if (aqWaitTimerRef.current) {
        window.clearTimeout(aqWaitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncAqTarget = () => {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>("[data-nav-logo-anchor]"),
      );
      const visible = candidates.find((el) => el.offsetParent !== null);
      if (!visible) return false;
      const rect = visible.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      setAqLogoTarget({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      return true;
    };

    const run = () => {
      if (cancelled) return;
      const found = syncAqTarget();
      if (!found) window.setTimeout(run, 120);
    };

    run();
    window.addEventListener("resize", syncAqTarget, { passive: true });
    window.addEventListener("orientationchange", syncAqTarget);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", syncAqTarget);
      window.removeEventListener("orientationchange", syncAqTarget);
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
          ? { duration: 1.05, ease: wipeEase }
          : { duration: 0 }
      }
    >
      <FilmGrain />

      {/* Hidden phase driver: preserves existing introPhase timing transitions
          without rendering the AQ fly-in visually. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed z-[1002] font-monument font-bold text-[var(--accent)] opacity-0"
        style={{
          fontSize: "1px",
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
                left: aqLogoTarget.x,
                top: aqLogoTarget.y,
                x: "-50%",
                y: "-50%",
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
            ? { duration: AQ_FLYOUT_MS / 1000, ease: letterEase }
            : { duration: AQ_ENTER_MS / 1000, ease: letterEase }
        }
        onAnimationComplete={() => {
          if (aqEnterCompleteRef.current) return;
          aqEnterCompleteRef.current = true;
          setIntroPhase("aq-wait");
          aqWaitTimerRef.current = window.setTimeout(
            () => setIntroPhase("names"),
            AQ_WAIT_MS,
          );
        }}
      >
        AQ
      </motion.div>

      <div className="relative flex h-full w-full flex-col items-center justify-center gap-0 px-4">
        <div
          className="relative flex items-center justify-center"
          style={{
            width: "clamp(280px, 50vw, 520px)",
            height: "clamp(280px, 50vw, 520px)",
          }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            fill="none"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="50"
              cy="50"
              r="47"
              stroke="rgba(110,240,200,0.16)"
              strokeWidth="0.4"
              fill="none"
            />

            <motion.circle
              cx="50"
              cy="50"
              r="47"
              stroke="rgba(110,240,200,0.95)"
              strokeWidth="0.4"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 1 }}
              animate={
                exitArmed
                  ? { pathLength: 1, opacity: [1, 1, 0] }
                  : { pathLength: p / 100, opacity: 1 }
              }
              transition={
                exitArmed
                  ? {
                      pathLength: { duration: 0.4, ease: "easeOut" },
                      opacity: { duration: 0.4, times: [0, 0.55, 1], ease: "easeOut" },
                    }
                  : { duration: 0.3, ease: "easeOut" }
              }
              style={{
                filter: "drop-shadow(0 0 4px rgba(110,240,200,0.55))",
              }}
            />

            <motion.circle
              cx="50"
              cy="50"
              r="44"
              stroke="rgba(110,240,200,0.12)"
              strokeWidth="0.3"
              fill="none"
              strokeDasharray="1 3"
              animate={{ rotate: 360 }}
              transition={{ duration: 18, ease: "linear", repeat: Infinity }}
              style={{ transformOrigin: "50px 50px" }}
            />

            <motion.circle
              cx="50"
              cy="50"
              r="41"
              stroke="rgba(110,240,200,0.2)"
              strokeWidth="0.3"
              fill="none"
              strokeDasharray="0.5 4"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, ease: "linear", repeat: Infinity }}
              style={{ transformOrigin: "50px 50px" }}
            />

            {[0, 90, 180, 270].map((angle) => (
              <line
                key={angle}
                x1="50"
                y1="3.5"
                x2="50"
                y2="6"
                stroke="rgba(110,240,200,0.35)"
                strokeWidth="0.4"
                style={{
                  transformOrigin: "50px 50px",
                  transform: `rotate(${angle}deg)`,
                }}
              />
            ))}
          </svg>

          <div className="relative z-10 flex flex-col items-center justify-center gap-0 text-center">
            <motion.span
              style={{
                fontFamily: "monospace",
                fontSize: "clamp(0.7rem, 1.5vw, 0.85rem)",
                color: "rgba(110,240,200,0.45)",
                letterSpacing: "0.2em",
                marginBottom: "8px",
                display: "block",
                textAlign: "center",
              }}
              animate={{ opacity: exitArmed ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {String(Math.round(p)).padStart(3, "0")}
            </motion.span>

            {showNameBlock && (
              <motion.div
                className="my-1.5 h-px w-14 bg-[var(--accent)]/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: exitArmed ? 0 : 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
