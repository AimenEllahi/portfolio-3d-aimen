"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/components/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

const TEST_FONT_PX = 100;
const LETTER_TRACK = 0.02;

function readHeroScaleOrigin(
  iw: number,
  ih: number,
  mLetter: SVGTSpanElement | null,
) {
  if (!mLetter) {
    return { x: nudgeScaleOriginX(iw / 2, iw), y: ih * 0.45 };
  }
  try {
    const bb = mLetter.getBBox();
    if (bb.width > 0 && bb.height > 0) {
      return {
        x: nudgeScaleOriginX(bb.x + bb.width / 2, iw),
        y: bb.y + bb.height / 2,
      };
    }
  } catch {
    /* layout thrash */
  }
  return { x: nudgeScaleOriginX(iw / 2, iw), y: ih * 0.45 };
}

/** Shift zoom pivot slightly left so the expanding cutout lines up with flying into “M”. */
function nudgeScaleOriginX(cx: number, viewportWidth: number) {
  const shift = Math.min(56, viewportWidth * 0.024);
  return cx - shift;
}

/** Scroll distance (as vh) while hero remains pinned. */
function heroPinDistanceVhForWidth(w: number): number {
  if (w < 480) return 100;
  if (w < 768) return 115;
  if (w < 1024) return 130;
  return 150;
}

const textStyle = (fontSize: number): CSSProperties => ({
  fontFamily:
    "var(--font-monument), ui-sans-serif, system-ui, sans-serif",
  fontSize,
  letterSpacing: `${fontSize * LETTER_TRACK}px`,
  fontWeight: 700,
  fill: "#000000",
  textAnchor: "middle",
  dominantBaseline: "middle",
});

export type HeroSectionProps = {
  sectionId?: string;
  /** Runs once GSAP scrub + stencil are wired (fonts measured). */
  onHeroReady?: () => void;
};

export default function HeroSection({
  sectionId = "home",
  onHeroReady,
}: HeroSectionProps) {
  const rawId = useId().replace(/:/g, "");
  const maskId = `hero-name-mask-${rawId}`;

  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const backdropBlurLayerRef = useRef<HTMLDivElement>(null);
  const maskLayerRef = useRef<HTMLDivElement>(null);
  const textGroupRef = useRef<SVGGElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const measureLine1Ref = useRef<SVGTextElement>(null);
  const measureLine2Ref = useRef<SVGTextElement>(null);
  const svgMaskRootRef = useRef<SVGSVGElement>(null);
  const maskWhiteRectRef = useRef<SVGRectElement>(null);
  const maskElementRef = useRef<SVGMaskElement>(null);
  const textLine1Ref = useRef<SVGTextElement>(null);
  const textLine2Ref = useRef<SVGTextElement>(null);
  const mLetterRef = useRef<SVGTSpanElement | null>(null);
  /** Center of letter "M" in mask SVG units — zoom feels like diving into that glyph */
  const scaleOriginRef = useRef<{ x: number; y: number }>({
    x:
      typeof window !== "undefined"
        ? nudgeScaleOriginX(window.innerWidth / 2, window.innerWidth)
        : 936,
    y: typeof window !== "undefined" ? window.innerHeight * 0.45 : 400,
  });

  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const introOpacityLockRef = useRef(true);
  const introRanRef = useRef(false);

  const [fontsReady, setFontsReady] = useState(false);
  const [fontPx, setFontPx] = useState(0);

  const [maxScaleBoost, setMaxScaleBoost] = useState(45);
  const [heroPinDistanceVh, setHeroPinDistanceVh] = useState(125);

  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const onHeroReadyRef = useRef(onHeroReady);
  onHeroReadyRef.current = onHeroReady;
  const heroReadyNotifiedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const syncBoost = () => setMaxScaleBoost(mq.matches ? 28 : 45);
    syncBoost();
    mq.addEventListener("change", syncBoost);
    return () => mq.removeEventListener("change", syncBoost);
  }, []);

  useEffect(() => {
    const syncPinDistance = () =>
      setHeroPinDistanceVh(heroPinDistanceVhForWidth(window.innerWidth));
    syncPinDistance();
    window.addEventListener("resize", syncPinDistance, { passive: true });
    return () => window.removeEventListener("resize", syncPinDistance);
  }, []);

  const syncSvgMaskGeometry = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const svg = svgMaskRootRef.current;
    const rect = maskWhiteRectRef.current;
    const maskEl = maskElementRef.current;
    const t1 = textLine1Ref.current;
    const t2 = textLine2Ref.current;
    if (!svg || !rect || !maskEl) return;

    maskEl.setAttribute("mask-type", "luminance");
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

    maskEl.setAttribute("width", String(w));
    maskEl.setAttribute("height", String(h));

    rect.setAttribute("width", String(w));
    rect.setAttribute("height", String(h));

    if (t1 && fontPx > 0) {
      t1.setAttribute("x", String(w / 2));
      t1.setAttribute("y", String(h * 0.45));
    }
    if (t2 && fontPx > 0) {
      t2.setAttribute("x", String(w / 2));
      t2.setAttribute("y", String(h * 0.75));
    }
  }, [fontPx]);

  const measureAndPrepareFonts = useCallback(async () => {
    await document.fonts.ready.catch(() => undefined);
    const t1 = measureLine1Ref.current;
    const t2 = measureLine2Ref.current;
    if (!t1 || !t2) return;
    try {
      const w1 = t1.getComputedTextLength();
      const w2 = t2.getComputedTextLength();
      const maxW = Math.max(w1, w2);
      if (maxW <= 0) {
        setFontPx(120);
        setFontsReady(true);
        return;
      }
      const iw = window.innerWidth;
      const inset = iw < 480 ? 0.86 : iw < 768 ? 0.88 : 0.9;
      const scale = (iw * inset) / maxW;
      const finalSize = Math.round(TEST_FONT_PX * scale);
      const px = Math.max(32, Math.min(finalSize, 520));
      setFontPx(px);
      setFontsReady(true);
    } catch {
      setFontPx(120);
      setFontsReady(true);
    }
  }, []);

  useLayoutEffect(() => {
    if (!fontsReady || fontPx <= 0) return;
    const line1 = textLine1Ref.current;
    const line2 = textLine2Ref.current;
    if (line1 && line2) {
      line1.setAttribute("font-size", String(fontPx));
      line2.setAttribute("font-size", String(fontPx));
      const track = fontPx * LETTER_TRACK;
      line1.setAttribute("letter-spacing", `${track}px`);
      line2.setAttribute("letter-spacing", `${track}px`);
    }
    syncSvgMaskGeometry();
  }, [fontsReady, fontPx, syncSvgMaskGeometry]);

  useLayoutEffect(() => {
    if (!fontsReady || fontPx <= 0) return;
    const iw = typeof window !== "undefined" ? window.innerWidth : 1920;
    const ih = typeof window !== "undefined" ? window.innerHeight : 1080;
    scaleOriginRef.current = readHeroScaleOrigin(iw, ih, mLetterRef.current);
  }, [fontsReady, fontPx, syncSvgMaskGeometry]);

  useLayoutEffect(() => {
    const el = maskLayerRef.current;
    if (el) el.style.opacity = "0";
  }, []);

  useLayoutEffect(() => {
    maskElementRef.current?.setAttribute("mask-type", "luminance");
  }, []);

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        measureAndPrepareFonts();
      });
    });
    return () => {
      cancelled = true;
    };
  }, [measureAndPrepareFonts]);

  useEffect(() => {
    if (!fontsReady || fontPx <= 0) return;
    const onResize = () => {
      measureAndPrepareFonts();
      requestAnimationFrame(() => {
        syncSvgMaskGeometry();
        const iw = window.innerWidth;
        const ih = window.innerHeight;
        scaleOriginRef.current = readHeroScaleOrigin(
          iw,
          ih,
          mLetterRef.current,
        );
        ScrollTrigger.refresh();
        lenisRef.current?.resize();
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [fontsReady, fontPx, measureAndPrepareFonts, syncSvgMaskGeometry]);

  /* ── Entrance: black mask fades in after preloader ── */
  useEffect(() => {
    const fallbackMs = 2600;
    let fallbackId: number | null = null;

    const startIntro = () => {
      if (introRanRef.current) return;
      const el = maskLayerRef.current;
      if (!el) return;
      introRanRef.current = true;
      if (fallbackId != null) {
        window.clearTimeout(fallbackId);
        fallbackId = null;
      }
      el.style.transition =
        "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s";
      window.requestAnimationFrame(() => {
        el.style.opacity = "1";
      });
      window.setTimeout(() => {
        introOpacityLockRef.current = false;
      }, 300 + 1200 + 80);
    };

    const w = window as Window & { __heroPreloaderComplete?: boolean };
    if (w.__heroPreloaderComplete) {
      requestAnimationFrame(() => startIntro());
    }

    window.addEventListener("hero-preloader-complete", startIntro);

    fallbackId = window.setTimeout(() => {
      fallbackId = null;
      startIntro();
    }, fallbackMs);

    return () => {
      window.removeEventListener("hero-preloader-complete", startIntro);
      if (fallbackId != null) window.clearTimeout(fallbackId);
    };
  }, []);

  useEffect(() => {
    if (!lenis) return;
    ScrollTrigger.refresh();
    lenis.resize();
  }, [lenis]);

  /* ── GSAP scrub — DOM refs only in onUpdate (no React state) ── */
  useEffect(() => {
    if (!fontsReady) return;

    const section = sectionRef.current;
    const pinWrap = pinWrapRef.current;
    const textG = textGroupRef.current;
    const maskLayer = maskLayerRef.current;
    const scrollHint = scrollHintRef.current;
    if (!section || !pinWrap || !textG || !maskLayer || !scrollHint) return;

    const applyFrame = (p: number) => {
      const { x: cx, y: cy } = scaleOriginRef.current;
      const scrollEase = gsap.parseEase("power2.inOut")(p);
      const scale = 1 + scrollEase * maxScaleBoost;
      textG.setAttribute(
        "transform",
        `translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})`,
      );

      if (!introOpacityLockRef.current) {
        maskLayer.style.transition = "";
        /* Stencil fades early so WebGL dome + fog read clearly through clears */
        const fadeStart = 0.38;
        const fadeEnd = 0.42;
        let overlayOpacity = 1;
        if (p > fadeStart) {
          const span = fadeEnd - fadeStart;
          const t =
            span <= 0
              ? 1
              : Math.min(
                  1,
                  Math.max(0, (p - fadeStart) / span),
                );
          const stepped = gsap.parseEase("expo.in")(t);
          overlayOpacity = Math.max(0, 1 - stepped);
        }
        maskLayer.style.opacity = String(overlayOpacity);
        maskLayer.style.visibility =
          overlayOpacity <= 0.002 ? "hidden" : "visible";
        maskLayer.style.pointerEvents =
          overlayOpacity <= 0 ? "none" : "auto";
      }

      const hintAlpha = p < 0.08 ? 1 - p / 0.08 : 0;
      scrollHint.style.opacity = Math.max(0, hintAlpha).toFixed(3);

      const blurBackdrop = backdropBlurLayerRef.current;
      if (blurBackdrop) {
        const reveal = gsap.utils.clamp(0, 1, p / 0.86);
        const easedReveal = gsap.parseEase("power2.out")(reveal);
        const blurPx = 28 * Math.pow(1 - easedReveal, 1.25);
        if (blurPx < 0.6) {
          blurBackdrop.style.backdropFilter = "none";
          blurBackdrop.style.setProperty("-webkit-backdrop-filter", "none");
        } else {
          const bf = `blur(${blurPx.toFixed(1)}px) saturate(1.15)`;
          blurBackdrop.style.backdropFilter = bf;
          blurBackdrop.style.setProperty("-webkit-backdrop-filter", bf);
        }
      }
    };

    scaleOriginRef.current = readHeroScaleOrigin(
      window.innerWidth,
      window.innerHeight,
      mLetterRef.current,
    );

    scrollTriggerRef.current?.kill();

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${window.innerHeight * (heroPinDistanceVh / 100)}`,
      pin: pinWrap,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 1,
      onUpdate: (self) => applyFrame(self.progress),
    });

    ScrollTrigger.refresh();
    lenisRef.current?.resize();
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      lenisRef.current?.resize();
      if (scrollTriggerRef.current) {
        applyFrame(scrollTriggerRef.current.progress);
      }
      if (!heroReadyNotifiedRef.current) {
        heroReadyNotifiedRef.current = true;
        onHeroReadyRef.current?.();
      }
    });

    return () => {
      scrollTriggerRef.current?.kill();
      scrollTriggerRef.current = null;
    };
  }, [fontsReady, heroPinDistanceVh, maxScaleBoost]);

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="relative w-full bg-transparent"
      style={{ height: "100dvh" }}
    >
      <svg
        aria-hidden
        className="pointer-events-none  absolute h-px w-px overflow-hidden opacity-0"
      >
        <text
          ref={measureLine1Ref}
          x={0}
          y={0}
          style={{
            ...textStyle(TEST_FONT_PX),
            textAnchor: "start",
          }}
        >
          AIMEN
        </text>
        <text
          ref={measureLine2Ref}
          x={0}
          y={0}
          style={{
            ...textStyle(TEST_FONT_PX),
            textAnchor: "start",
          }}
        >
          QAISER
        </text>
      </svg>

      <div
        ref={pinWrapRef}
        className="relative flex h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-transparent"
      >
        <div
          ref={backdropBlurLayerRef}
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden
        />
        {/* Pinned by ScrollTrigger: scroll drives zoom — layout stays fixed */}
        <div
          ref={maskLayerRef}
          className="hero-stencil-overlay absolute inset-0 z-[1] bg-black"
          style={{
            willChange: "transform, opacity",
            WebkitMaskImage: `url(#${maskId})`,
            maskImage: `url(#${maskId})`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "0 0",
            maskPosition: "0 0",
          }}
        />

        <svg
          ref={svgMaskRootRef}
          className="pointer-events-none absolute inset-0 z-[2] h-full w-full max-w-none [&_defs]:pointer-events-none"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            maxWidth: "none",
          }}
          aria-hidden
          width={typeof window !== "undefined" ? window.innerWidth : 1920}
          height={typeof window !== "undefined" ? window.innerHeight : 1080}
          viewBox={
            typeof window !== "undefined"
              ? `0 0 ${window.innerWidth} ${window.innerHeight}`
              : "0 0 1920 1080"
          }
          preserveAspectRatio="none"
        >
          <defs>
            <mask
              ref={maskElementRef}
              id={maskId}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={
                typeof window !== "undefined" ? window.innerWidth : 1920
              }
              height={
                typeof window !== "undefined" ? window.innerHeight : 1080
              }
            >
              <rect
                ref={maskWhiteRectRef}
                x={0}
                y={0}
                width={
                  typeof window !== "undefined" ? window.innerWidth : 1920
                }
                height={
                  typeof window !== "undefined" ? window.innerHeight : 1080
                }
                fill="white"
              />
              <g ref={textGroupRef}>
                {fontsReady && fontPx > 0 ? (
                  <>
                    <text
                      ref={textLine1Ref}
                      x={
                        typeof window !== "undefined"
                          ? window.innerWidth / 2
                          : 960
                      }
                      y={
                        typeof window !== "undefined"
                          ? window.innerHeight * 0.45
                          : 486
                      }
                      fill="black"
                      style={textStyle(fontPx)}
                    >
                      <tspan>A</tspan>
                      <tspan>I</tspan>
                      <tspan ref={mLetterRef}>M</tspan>
                      <tspan>E</tspan>
                      <tspan>N</tspan>
                    </text>
                    <text
                      ref={textLine2Ref}
                      x={
                        typeof window !== "undefined"
                          ? window.innerWidth / 2
                          : 960
                      }
                      y={
                        typeof window !== "undefined"
                          ? window.innerHeight * 0.75
                          : 810
                      }
                      fill="black"
                      style={textStyle(fontPx)}
                    >
                      QAISER
                    </text>
                  </>
                ) : null}
              </g>
            </mask>
          </defs>
        </svg>

        <div
          ref={scrollHintRef}
          className="pointer-events-none absolute left-1/2 z-[3] flex -translate-x-1/2 flex-col items-center gap-3 select-none"
          style={{
            bottom: "max(2rem, calc(env(safe-area-inset-bottom, 0px) + 1.25rem))",
          }}
        >
          <span
            className="font-neue uppercase text-white"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.4em",
              opacity: 0.35,
            }}
          >
            Scroll
          </span>
          <div
            className="hero-scroll-line w-px bg-white opacity-20"
            style={{ height: 40, transformOrigin: "bottom center" }}
          />
        </div>
      </div>
    </section>
  );
}
