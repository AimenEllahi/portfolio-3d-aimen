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
  const maskLayerRef = useRef<SVGRectElement>(null);
  const textGroupRef = useRef<SVGGElement>(null);
  const visibleTextGroupRef = useRef<SVGGElement>(null);
  const heroIntroRef = useRef<HTMLDivElement>(null);
  const measureLine1Ref = useRef<SVGTextElement>(null);
  const measureLine2Ref = useRef<SVGTextElement>(null);
  const svgMaskRootRef = useRef<SVGSVGElement>(null);
  const maskWhiteRectRef = useRef<SVGRectElement>(null);
  const maskElementRef = useRef<SVGMaskElement>(null);
  const textLine1Ref = useRef<SVGTextElement>(null);
  const textLine2Ref = useRef<SVGTextElement>(null);
  const visibleLine1Ref = useRef<SVGTextElement>(null);
  const visibleLine2Ref = useRef<SVGTextElement>(null);
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

  const [fontsReady, setFontsReady] = useState(false);
  const [fontPx, setFontPx] = useState(0);
  const [nameRevealed, setNameRevealed] = useState(false);

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
    const maskRect = maskLayerRef.current;
    const t1 = textLine1Ref.current;
    const t2 = textLine2Ref.current;
    const v1 = visibleLine1Ref.current;
    const v2 = visibleLine2Ref.current;
    if (!svg || !rect || !maskEl) return;

    maskEl.setAttribute("mask-type", "luminance");
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

    maskEl.setAttribute("width", String(w));
    maskEl.setAttribute("height", String(h));
    if (maskRect) {
      maskRect.setAttribute("width", String(w));
      maskRect.setAttribute("height", String(h));
    }

    rect.setAttribute("width", String(w));
    rect.setAttribute("height", String(h));

    /** Mobile screens get tighter vertical spacing so the two name
     *  lines don't drift apart visually. Desktop layout unchanged. */
    const isMobile = w < 640;
    const aimenY = isMobile ? h * 0.43 : h * 0.31;
    const qaiserY = isMobile ? h * 0.57 : h * 0.61;

    if (t1 && fontPx > 0) {
      t1.setAttribute("x", String(w / 2));
      t1.setAttribute("y", String(aimenY));
    }
    if (t2 && fontPx > 0) {
      t2.setAttribute("x", String(w / 2));
      t2.setAttribute("y", String(qaiserY));
    }
    if (v1) { v1.setAttribute("x", String(w / 2)); v1.setAttribute("y", String(aimenY)); }
    if (v2) { v2.setAttribute("x", String(w / 2)); v2.setAttribute("y", String(qaiserY)); }
  }, [fontPx]);

  const measureAndPrepareFonts = useCallback(async () => {
    await document.fonts.ready.catch(() => undefined);
    try {
      let attempts = 0;
      let w1 = 0;
      let w2 = 0;
      while (attempts < 15) {
        const t1 = measureLine1Ref.current;
        const t2 = measureLine2Ref.current;
        if (t1 && t2) {
          w1 = t1.getComputedTextLength();
          w2 = t2.getComputedTextLength();
          if (w1 > 0 && w2 > 0) break;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 100));
        attempts += 1;
      }
      const maxW = Math.max(w1, w2);
      if (maxW <= 0) {
        const iw = window.innerWidth;
        setFontPx(Math.round(iw * 0.21));
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
    const frame = requestAnimationFrame(() => setNameRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, [fontsReady, fontPx]);

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
        window.setTimeout(() => ScrollTrigger.refresh(), 100);
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [fontsReady, fontPx, measureAndPrepareFonts, syncSvgMaskGeometry]);

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
    if (!section || !pinWrap || !textG || !maskLayer) return;

    const applyFrame = (p: number) => {
      const { x: cx, y: cy } = scaleOriginRef.current;
      const scrollEase = gsap.parseEase("power2.inOut")(p);
      const scale = 1 + scrollEase * maxScaleBoost;
      textG.setAttribute(
        "transform",
        `translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})`,
      );
      if (visibleTextGroupRef.current) {
        visibleTextGroupRef.current.setAttribute("transform", textG.getAttribute("transform") ?? "");
        visibleTextGroupRef.current.style.opacity = String(Math.max(0, 0.78 * (1 - p / 0.3)));
      }

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
            : Math.min(1, Math.max(0, (p - fadeStart) / span));
        const stepped = gsap.parseEase("expo.in")(t);
        overlayOpacity = Math.max(0, 1 - stepped);
      }
      maskLayer.style.opacity = String(overlayOpacity);
      if (overlayOpacity <= 0.002) {
        maskLayer.setAttribute("visibility", "hidden");
      } else {
        maskLayer.setAttribute("visibility", "visible");
      }

      if (heroIntroRef.current) heroIntroRef.current.style.opacity = String(Math.max(0, 1 - p / 0.16));

      const blurBackdrop = backdropBlurLayerRef.current;
      if (blurBackdrop && window.innerWidth >= 768) {
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
      } else if (blurBackdrop) {
        blurBackdrop.style.backdropFilter = "none";
        blurBackdrop.style.setProperty("-webkit-backdrop-filter", "none");
      }
    };

    scaleOriginRef.current = readHeroScaleOrigin(
      window.innerWidth,
      window.innerHeight,
      mLetterRef.current,
    );

    scrollTriggerRef.current?.kill();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyFrame(0);
      onHeroReadyRef.current?.();
      return;
    }

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${window.innerHeight * (heroPinDistanceVh / 100)}`,
      pin: pinWrap,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 0.4,
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
      style={{ minHeight: "100dvh" }}
    >
      <h1 className="sr-only">Aimen Qaiser — 3D Frontend Engineer</h1>
      <svg
        aria-hidden
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "2000px",
          height: "200px",
          opacity: 0,
          pointerEvents: "none",
          overflow: "visible",
        }}
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
        <svg
          ref={svgMaskRootRef}
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            maxWidth: "none",
            willChange: "opacity",
            opacity: nameRevealed ? 1 : 0,
            transition: "opacity 650ms cubic-bezier(0.16, 1, 0.3, 1)",
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
                          ? window.innerHeight * 0.31
                          : 335
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
                          ? window.innerHeight * 0.61
                          : 659
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
          <rect
            ref={maskLayerRef}
            x={0}
            y={0}
            width={typeof window !== "undefined" ? window.innerWidth : 1920}
            height={typeof window !== "undefined" ? window.innerHeight : 1080}
            fill="black"
            mask={`url(#${maskId})`}
            style={{ willChange: "opacity" }}
          />
          {fontsReady && fontPx > 0 ? (
            <g ref={visibleTextGroupRef} aria-hidden="true" style={{ opacity: 0.78, willChange: "opacity" }}>
              <text ref={visibleLine1Ref} x={typeof window !== "undefined" ? window.innerWidth / 2 : 960} y={typeof window !== "undefined" && window.innerWidth < 640 ? window.innerHeight * 0.43 : typeof window !== "undefined" ? window.innerHeight * 0.31 : 335} style={{ ...textStyle(fontPx), fill: "#d1f9ec" }}>AIMEN</text>
              <text ref={visibleLine2Ref} x={typeof window !== "undefined" ? window.innerWidth / 2 : 960} y={typeof window !== "undefined" && window.innerWidth < 640 ? window.innerHeight * 0.57 : typeof window !== "undefined" ? window.innerHeight * 0.61 : 659} style={{ ...textStyle(fontPx), fill: "#d1f9ec" }}>QAISER</text>
            </g>
          ) : null}
        </svg>

        <div ref={heroIntroRef} className="absolute inset-x-4 bottom-[15%] z-[3] flex flex-col items-center gap-3 text-center sm:bottom-[11%]">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/75 sm:text-sm">3D Frontend Engineer · Creative Developer</p>
          <a
            href="#projects"
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              history.pushState(null, "", "#projects");
              if (lenisRef.current) lenisRef.current.scrollTo("#projects");
              else document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-full border border-[var(--accent)]/65 bg-[var(--accent)]/10 px-5 py-2 text-sm font-medium text-[var(--accent)] transition-[background-color,border-color] hover:border-[var(--accent)] hover:bg-[var(--accent)]/20"
          >
            Explore Work ↓
          </a>
        </div>

      </div>
    </section>
  );
}
