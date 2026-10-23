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
import { heroPinDistanceVhForWidth } from "@/lib/heroMotion";
import styles from "./HeroLetters.module.css";

gsap.registerPlugin(ScrollTrigger);

const LETTER_TRACK = 0.02;
const HERO_NAME = "AIMEN";
const HERO_NAME_Y = 0.49;

function smoothStep01(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function buildWavePath(width: number, height: number, waveAmount = 1) {
  const start = -width;
  const end = width * 2;
  const amplitude = Math.max(3, Math.min(9, width * 0.006)) * waveAmount;
  const wavelength = width * 0.48;
  const points = 72;
  let path = `M ${start} 0`;
  for (let index = 1; index <= points; index += 1) {
    const x = start + ((end - start) * index) / points;
    const y = Math.sin((x / wavelength) * Math.PI * 2) * amplitude;
    path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${path} L ${end} ${height * 3} L ${start} ${height * 3} Z`;
}

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

const textStyle = (fontSize: number): CSSProperties => ({
  fontFamily:
    "var(--font-monument), ui-sans-serif, system-ui, sans-serif",
  fontSize,
  letterSpacing: `${fontSize * LETTER_TRACK}px`,
  fontWeight: 700,
  fill: "#000000",
  textAnchor: "middle",
  dominantBaseline: "middle",
  textRendering: "geometricPrecision",
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
  const liquidClipId = `hero-liquid-clip-${rawId}`;
  const liquidOutlineId = `hero-liquid-outline-${rawId}`;

  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const backdropBlurLayerRef = useRef<HTMLDivElement>(null);
  const maskLayerRef = useRef<SVGRectElement>(null);
  const textGroupRef = useRef<SVGGElement>(null);
  const visibleTextGroupRef = useRef<SVGGElement>(null);
  const productStageRef = useRef<HTMLDivElement>(null);
  const productPositionRef = useRef<HTMLDivElement>(null);
  const productWordRef = useRef<HTMLDivElement>(null);
  const liquidSvgRef = useRef<SVGSVGElement>(null);
  const liquidClipTextRef = useRef<SVGTextElement>(null);
  const liquidOutlineTextRef = useRef<SVGTextElement>(null);
  const liquidWaveRef = useRef<SVGPathElement>(null);
  const productRotatorsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const productFrontsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const flipTweensRef = useRef<gsap.core.Tween[]>([]);
  const touchWaveRef = useRef<gsap.core.Timeline | null>(null);
  const heroIntroRef = useRef<HTMLDivElement>(null);
  const svgMaskRootRef = useRef<SVGSVGElement>(null);
  const maskWhiteRectRef = useRef<SVGRectElement>(null);
  const maskElementRef = useRef<SVGMaskElement>(null);
  const textLine1Ref = useRef<SVGTextElement>(null);
  const visibleLine1Ref = useRef<SVGTextElement>(null);
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
  const waveAmountRef = useRef(1);
  const handoffRef = useRef(1);
  const idleLayerHiddenRef = useRef(false);
  const introCompleteRef = useRef(false);
  const introRevealRef = useRef(0);

  const [fontsReady, setFontsReady] = useState(false);
  const [fontPx, setFontPx] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);
  const introReady = fontsReady && fontPx > 0;

  const [maxScaleBoost, setMaxScaleBoost] = useState(45);

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

  const syncSvgMaskGeometry = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const svg = svgMaskRootRef.current;
    const liquidSvg = liquidSvgRef.current;
    const rect = maskWhiteRectRef.current;
    const maskEl = maskElementRef.current;
    const maskRect = maskLayerRef.current;
    const t1 = textLine1Ref.current;
    const v1 = visibleLine1Ref.current;
    if (!svg || !rect || !maskEl) return;

    maskEl.setAttribute("mask-type", "luminance");
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    if (liquidSvg) liquidSvg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    liquidWaveRef.current?.setAttribute("d", buildWavePath(w, h, waveAmountRef.current));

    maskEl.setAttribute("width", String(w));
    maskEl.setAttribute("height", String(h));
    if (maskRect) {
      maskRect.setAttribute("width", String(w));
      maskRect.setAttribute("height", String(h));
    }

    rect.setAttribute("width", String(w));
    rect.setAttribute("height", String(h));

    const nameY = h * HERO_NAME_Y;

    if (t1 && fontPx > 0) {
      t1.setAttribute("x", String(w / 2));
      t1.setAttribute("y", String(nameY));
    }
    if (v1) {
      v1.setAttribute("x", String(w / 2));
      v1.setAttribute("y", String(nameY));
    }
    const liquidText = liquidClipTextRef.current;
    if (liquidText) {
      liquidText.setAttribute("x", String(w / 2));
      liquidText.setAttribute("y", String(nameY));
    }
    const outlineText = liquidOutlineTextRef.current;
    if (outlineText) {
      outlineText.setAttribute("x", String(w / 2));
      outlineText.setAttribute("y", String(nameY));
    }

    const word = productWordRef.current;
    if (word && fontPx > 0) {
      const width = word.offsetWidth;
      for (const text of [t1, v1, liquidText, outlineText]) {
        if (!text) continue;
        text.setAttribute("textLength", String(width));
        text.setAttribute("lengthAdjust", "spacingAndGlyphs");
      }
    }
  }, [fontPx]);

  const measureAndPrepareFonts = useCallback(async () => {
    await document.fonts.ready.catch(() => undefined);
    const word = productWordRef.current;
    const measuredSize = word ? parseFloat(window.getComputedStyle(word).fontSize) : 0;
    setFontPx(measuredSize > 0 ? measuredSize : Math.max(32, window.innerWidth * 0.22));
    setFontsReady(true);
  }, []);

  useLayoutEffect(() => {
    if (!fontsReady || fontPx <= 0) return;
    const line1 = textLine1Ref.current;
    if (line1) {
      line1.setAttribute("font-size", String(fontPx));
      const track = fontPx * LETTER_TRACK;
      line1.setAttribute("letter-spacing", `${track}px`);
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

  const isNameInteractive = useCallback(
    () => introCompleteRef.current && handoffRef.current > 0.98,
    [],
  );

  const syncProductStage = useCallback(() => {
    const stage = productStageRef.current;
    if (stage) stage.style.opacity = String(handoffRef.current);
    const position = productPositionRef.current;
    if (position) {
      position.style.pointerEvents = isNameInteractive() ? "auto" : "none";
    }
  }, [isNameInteractive]);

  const syncIntro = useCallback(() => {
    const intro = heroIntroRef.current;
    if (!intro) return;
    const progress = scrollTriggerRef.current?.progress ?? 0;
    intro.style.opacity = String(introRevealRef.current * Math.max(0, 1 - progress / 0.16));
    intro.style.pointerEvents = introRevealRef.current > 0.9 && progress < 0.1 ? "auto" : "none";
  }, []);

  useEffect(() => {
    if (!fontsReady || !introComplete) return;
    const section = sectionRef.current;
    const word = productWordRef.current;
    if (!section || !word) return;

    const rotators = productRotatorsRef.current.filter((node): node is HTMLSpanElement => Boolean(node));
    const fronts = productFrontsRef.current.filter((node): node is HTMLSpanElement => Boolean(node));
    const buttons = Array.from(section.querySelectorAll<HTMLButtonElement>("[data-hero-product-letter]"));
    if (rotators.length !== HERO_NAME.length || fronts.length !== HERO_NAME.length) return;

    const mm = gsap.matchMedia();
    mm.add({
      desktop: "(hover: hover) and (pointer: fine)",
      touch: "(pointer: coarse)",
      reducedMotion: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      const { desktop, touch, reducedMotion } = context.conditions as {
        desktop: boolean;
        touch: boolean;
        reducedMotion: boolean;
      };
      gsap.set(rotators, { rotationY: 0, transformPerspective: 1000 });
      if (reducedMotion) return;

      const flips = rotators.map((rotator) => gsap.to(rotator, {
        rotationY: 180,
        duration: 0.48,
        ease: "power2.inOut",
        paused: true,
      }));
      flipTweensRef.current = flips;

      if (desktop) {
        let hitMap: {
          x: number;
          y: number;
          width: number;
          height: number;
          pixels: Uint8ClampedArray;
        } | null = null;
        let activeIndex = -1;
        let discoveryActive = false;
        let leaveTimer = 0;
        let resizeFrame = 0;

        const interruptDiscovery = (nextIndex: number) => {
          if (!discoveryActive || nextIndex < 0) return;
          discoveryActive = false;
          flips[0].eventCallback("onComplete", null);
          if (nextIndex !== 0) flips[0].reverse();
        };

        const buildHitMap = () => {
          const wordBounds = word.getBoundingClientRect();
          const width = Math.ceil(wordBounds.width);
          const height = Math.ceil(wordBounds.height);
          if (!width || !height) return;
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return;
          ctx.textBaseline = "top";
          const fit = wordBounds.width / word.offsetWidth;
          buttons.forEach((button, index) => {
            const bounds = button.getBoundingClientRect();
            const style = window.getComputedStyle(button);
            const size = parseFloat(style.fontSize);
            ctx.save();
            ctx.translate(bounds.left - wordBounds.left, bounds.top - wordBounds.top + size * 0.05);
            ctx.scale(fit, 1);
            ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            ctx.fillStyle = `rgb(${(index + 1) * 40}, 0, 0)`;
            ctx.fillText(HERO_NAME[index], 0, 0);
            ctx.restore();
          });
          hitMap = {
            x: wordBounds.left,
            y: wordBounds.top,
            width,
            height,
            pixels: ctx.getImageData(0, 0, width, height).data,
          };
        };

        const hitLetterAt = (x: number, y: number) => {
          if (!hitMap) return -1;
          const px = Math.floor(x - hitMap.x);
          const py = Math.floor(y - hitMap.y);
          if (px < 0 || py < 0 || px >= hitMap.width || py >= hitMap.height) return -1;
          const offset = (py * hitMap.width + px) * 4;
          if (hitMap.pixels[offset + 3] < 32) return -1;
          return Math.round(hitMap.pixels[offset] / 40) - 1;
        };

        const onPointerMove = (event: PointerEvent) => {
          if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
          const nextIndex = isNameInteractive() ? hitLetterAt(event.clientX, event.clientY) : -1;
          interruptDiscovery(nextIndex);
          if (nextIndex === activeIndex) {
            if (leaveTimer) window.clearTimeout(leaveTimer);
            leaveTimer = 0;
            if (nextIndex >= 0 && flips[nextIndex].paused() && flips[nextIndex].progress() === 0) {
              flips[nextIndex].play();
            }
            return;
          }
          if (nextIndex < 0 && activeIndex >= 0) {
            if (!leaveTimer) {
              leaveTimer = window.setTimeout(() => {
                flips[activeIndex]?.reverse();
                activeIndex = -1;
                leaveTimer = 0;
                word.style.cursor = "";
              }, 90);
            }
            return;
          }
          if (leaveTimer) window.clearTimeout(leaveTimer);
          leaveTimer = 0;
          if (activeIndex >= 0) flips[activeIndex].reverse();
          activeIndex = nextIndex;
          if (activeIndex >= 0) {
            flips[activeIndex].play();
            word.style.cursor = "pointer";
          }
        };

        const onResize = () => {
          window.cancelAnimationFrame(resizeFrame);
          resizeFrame = window.requestAnimationFrame(buildHitMap);
        };
        buildHitMap();
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("resize", onResize, { passive: true });
        const removeListeners = buttons.map((button, index) => {
          const play = () => {
            if (!isNameInteractive()) return;
            interruptDiscovery(index);
            flips[index].play();
          };
          const reverse = () => flips[index].reverse();
          button.addEventListener("focus", play);
          button.addEventListener("blur", reverse);
          return () => {
            button.removeEventListener("focus", play);
            button.removeEventListener("blur", reverse);
          };
        });
        if ((scrollTriggerRef.current?.progress ?? 0) < 0.02) {
          discoveryActive = true;
          flips[0].eventCallback("onComplete", () => {
            discoveryActive = false;
            if (activeIndex !== 0) flips[0].reverse();
          });
          flips[0].play();
        }
        return () => {
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("resize", onResize);
          window.cancelAnimationFrame(resizeFrame);
          if (leaveTimer) window.clearTimeout(leaveTimer);
          word.style.cursor = "";
          removeListeners.forEach((remove) => remove());
          flipTweensRef.current = [];
        };
      }

      if (touch) {
        const wave = gsap.timeline({ paused: true });
        wave
          .to(rotators, { rotationY: 22, duration: 0.25, ease: "power2.out", stagger: 0.065 }, 0)
          .to(fronts, { color: "#6ef0c8", y: -3, duration: 0.25, ease: "power2.out", stagger: 0.065 }, 0)
          .to(rotators, { rotationY: 0, duration: 0.4, ease: "power3.out", stagger: 0.065 }, 0.28)
          .to(fronts, { color: "#edf5ef", y: 0, duration: 0.4, ease: "power3.out", stagger: 0.065 }, 0.28);
        touchWaveRef.current = wave;
        let discoveryActive = false;
        const playWave = () => {
          if (!isNameInteractive()) return;
          if (discoveryActive) {
            discoveryActive = false;
            flips[0].eventCallback("onComplete", null);
            flips[0].pause(0);
          }
          wave.restart();
        };
        word.addEventListener("click", playWave);
        if ((scrollTriggerRef.current?.progress ?? 0) < 0.02) {
          discoveryActive = true;
          flips[0].eventCallback("onComplete", () => {
            discoveryActive = false;
            flips[0].reverse();
          });
          flips[0].play();
        }
        return () => {
          word.removeEventListener("click", playWave);
          touchWaveRef.current = null;
        };
      }
    }, section);

    return () => {
      mm.revert();
      flipTweensRef.current = [];
      touchWaveRef.current = null;
    };
  }, [fontsReady, fontPx, introComplete, isNameInteractive]);

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
      const handoff = smoothStep01((p - 0.025) / 0.135);
      handoffRef.current = 1 - handoff;
      syncProductStage();
      if (handoff >= 0.999 && !idleLayerHiddenRef.current) {
        flipTweensRef.current.forEach((flip) => flip.pause(0));
        touchWaveRef.current?.pause(0);
        idleLayerHiddenRef.current = true;
      } else if (handoff < 0.999) {
        idleLayerHiddenRef.current = false;
      }

      const { x: cx, y: cy } = scaleOriginRef.current;
      const scrollEase = gsap.parseEase("power4.in")(p);
      const scale = 1 + scrollEase * maxScaleBoost;
      textG.setAttribute(
        "transform",
        `translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})`,
      );
      if (visibleTextGroupRef.current) {
        visibleTextGroupRef.current.setAttribute("transform", textG.getAttribute("transform") ?? "");
        visibleTextGroupRef.current.style.opacity = String(Math.max(0, 0.78 * handoff * (1 - p / 0.55)));
      }

      maskLayer.style.transition = "";
      /* Keep the stencil through the zoom, then reveal the scene at the handoff. */
      const fadeStart = 0.78;
      const fadeEnd = 0.96;
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

      syncIntro();

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
      end: () => `+=${window.innerHeight * (heroPinDistanceVhForWidth(window.innerWidth) / 100)}`,
      pin: pinWrap,
      pinSpacing: false,
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
  }, [fontsReady, maxScaleBoost, syncProductStage, syncIntro]);

  useEffect(() => {
    if (!introReady || introCompleteRef.current) return;

    const section = sectionRef.current;
    const stage = productStageRef.current;
    const liquid = liquidSvgRef.current;
    const wave = liquidWaveRef.current;
    const name = textLine1Ref.current;
    const fronts = productFrontsRef.current.filter((node): node is HTMLSpanElement => Boolean(node));
    const chrome = document.querySelector<HTMLElement>("[data-hero-chrome]");
    if (!section || !stage || !liquid || !wave || !name || fronts.length !== HERO_NAME.length) return;

    const finishIntro = () => {
      gsap.set(stage, { y: 0, scale: 1 });
      gsap.set(liquid, { opacity: 0 });
      gsap.set(fronts, { color: "#edf5ef", filter: "none", opacity: 1 });
      if (chrome) gsap.set(chrome, { autoAlpha: 1 });
      section.style.zIndex = "20";
      introRevealRef.current = 1;
      introCompleteRef.current = true;
      syncIntro();
      syncProductStage();
      setIntroComplete(true);
    };

    const hasDeepLink = window.location.hash !== "" && window.location.hash !== "#home";
    const shouldSkip = window.matchMedia("(prefers-reduced-motion: reduce)").matches || hasDeepLink;
    if (shouldSkip) {
      finishIntro();
      return;
    }

    if (window.scrollY > 0) {
      window.scrollTo(0, 0);
      lenisRef.current?.scrollTo(0, { immediate: true });
      ScrollTrigger.update();
    }

    const bounds = name.getBBox();
    const bottom = bounds.y + bounds.height + 12;
    const top = bounds.y - 12;
    waveAmountRef.current = 1;
    wave.setAttribute("d", buildWavePath(window.innerWidth, window.innerHeight));
    gsap.set(wave, { x: 0, y: bottom });
    gsap.set(liquid, { opacity: 1 });
    gsap.set(fronts, { filter: "none", opacity: 0 });

    const waveDrift = gsap.to(wave, {
      x: -window.innerWidth * 0.48,
      duration: 3.2,
      ease: "none",
      repeat: -1,
    });
    const waveState = { amount: 1 };
    const timeline = gsap.timeline({ onComplete: finishIntro });
    timeline
      .to(wave, { y: top, duration: 2, ease: "sine.inOut" })
      .call(() => { waveDrift.pause(); })
      .to(waveState, {
        amount: 0,
        duration: 0.18,
        ease: "sine.out",
        onUpdate: () => {
          waveAmountRef.current = waveState.amount;
          wave.setAttribute("d", buildWavePath(window.innerWidth, window.innerHeight, waveState.amount));
        },
      })
      .to(stage, { y: 0, scale: 1, duration: 0.5, ease: "power2.inOut" }, "+=0.08")
      .addLabel("heroReveal", "-=0.22")
      .to(liquid, { opacity: 0, duration: 0.42, ease: "power2.inOut" }, "heroReveal")
      .to(fronts, { opacity: 1, duration: 0.42, ease: "power2.inOut" }, "heroReveal")
      .call(() => { section.style.zIndex = "20"; }, [], "heroReveal")
      .to(introRevealRef, {
        current: 1,
        duration: 0.42,
        ease: "power2.out",
        onUpdate: syncIntro,
      }, "heroReveal+=0.08");
    if (chrome) {
      timeline.to(chrome, { autoAlpha: 1, duration: 0.42, ease: "power2.out" }, "heroReveal+=0.08");
    }

    return () => {
      timeline.kill();
      waveDrift.kill();
    };
  }, [introReady, syncIntro, syncProductStage]);

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="relative z-[200] w-full bg-transparent"
      style={{ minHeight: "100dvh" }}
    >
      <h1 className="sr-only">Aimen — 3D Frontend Engineer</h1>
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
          }}
          aria-hidden
          width={1920}
          height={1080}
          viewBox="0 0 1920 1080"
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
              width={1920}
              height={1080}
            >
              <rect
                ref={maskWhiteRectRef}
                x={0}
                y={0}
                width={1920}
                height={1080}
                fill="white"
              />
              <g ref={textGroupRef}>
                {fontsReady && fontPx > 0 ? (
                  <text
                    ref={textLine1Ref}
                    x={typeof window !== "undefined" ? window.innerWidth / 2 : 960}
                    y={typeof window !== "undefined" ? window.innerHeight * HERO_NAME_Y : 529}
                    fill="black"
                    style={textStyle(fontPx)}
                  >
                    {Array.from(HERO_NAME).map((letter, index) => (
                      <tspan key={index} ref={index === 2 ? mLetterRef : undefined} data-hero-letter={`0-${index}`}>{letter}</tspan>
                    ))}
                  </text>
                ) : null}
              </g>
            </mask>
          </defs>
          <rect
            ref={maskLayerRef}
            x={0}
            y={0}
            width={1920}
            height={1080}
            fill="black"
            mask={`url(#${maskId})`}
            style={{ willChange: "opacity" }}
          />
          {fontsReady && fontPx > 0 ? (
            <g ref={visibleTextGroupRef} aria-hidden="true" style={{ opacity: 0, willChange: "opacity" }}>
              <text ref={visibleLine1Ref} x={typeof window !== "undefined" ? window.innerWidth / 2 : 960} y={typeof window !== "undefined" ? window.innerHeight * HERO_NAME_Y : 529} style={{ ...textStyle(fontPx), fill: "#d1f9ec" }}>
                {Array.from(HERO_NAME).map((letter, index) => (
                  <tspan key={index} data-hero-letter={`0-${index}`}>{letter}</tspan>
                ))}
              </text>
            </g>
          ) : null}
        </svg>

        <div ref={productStageRef} className={styles.stage} style={{ opacity: 1 }}>
          <div ref={productPositionRef} className={styles.wordPosition} style={{ pointerEvents: "none" }}>
            <div
              ref={productWordRef}
              className={styles.word}
              aria-label="AIMEN interactive letters"
            >
              {Array.from(HERO_NAME).map((letter, index) => (
                <button
                  key={index}
                  type="button"
                  data-hero-product-letter={index}
                  className={styles.letter}
                  aria-label={`Animate letter ${letter}`}
                  tabIndex={introComplete ? 0 : -1}
                >
                  <span className={styles.sizer} aria-hidden="true">{letter}</span>
                  <span ref={(node) => { productRotatorsRef.current[index] = node; }} data-hero-letter={`0-${index}`} className={styles.rotator} aria-hidden="true">
                    <span
                      ref={(node) => { productFrontsRef.current[index] = node; }}
                      className={`${styles.face} ${styles.front}`}
                      style={{ filter: `url(#${liquidOutlineId})` }}
                    >
                      {letter}
                    </span>
                    <span className={`${styles.face} ${styles.back}`}>{letter}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <svg
            ref={liquidSvgRef}
            className={styles.liquid}
            aria-hidden="true"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id={liquidOutlineId} x="-10%" y="-10%" width="120%" height="120%">
                <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="expanded" />
                <feComposite in="expanded" in2="SourceAlpha" operator="out" result="ring" />
                <feFlood floodColor="#edf5ef" result="outlineColor" />
                <feComposite in="outlineColor" in2="ring" operator="in" />
              </filter>
              <clipPath id={liquidClipId} clipPathUnits="userSpaceOnUse">
                {fontsReady && fontPx > 0 && (
                  <text
                    ref={liquidClipTextRef}
                    x={typeof window !== "undefined" ? window.innerWidth / 2 : 960}
                    y={typeof window !== "undefined" ? window.innerHeight * HERO_NAME_Y : 529}
                    style={textStyle(fontPx)}
                  >
                    {HERO_NAME}
                  </text>
                )}
              </clipPath>
            </defs>
            <g clipPath={`url(#${liquidClipId})`}>
              <path
                ref={liquidWaveRef}
                d={buildWavePath(1920, 1080)}
                fill="var(--accent)"
              />
            </g>
            {fontsReady && fontPx > 0 && (
              <text
                ref={liquidOutlineTextRef}
                x={typeof window !== "undefined" ? window.innerWidth / 2 : 960}
                y={typeof window !== "undefined" ? window.innerHeight * HERO_NAME_Y : 529}
                style={{ ...textStyle(fontPx), fill: "#edf5ef" }}
                filter={`url(#${liquidOutlineId})`}
              >
                {HERO_NAME}
              </text>
            )}
          </svg>
        </div>

        <div ref={heroIntroRef} className="absolute inset-x-4 bottom-[15%] z-[3] flex flex-col items-center gap-3 text-center sm:bottom-[11%]" style={{ opacity: 0, pointerEvents: "none" }}>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/75 sm:text-sm">3D Frontend Engineer · Creative Developer</p>
          <a
            href="#projects"
            tabIndex={introComplete ? undefined : -1}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              const section = document.querySelector("#projects");
              if (!section) return;
              history.pushState(null, "", "#projects");
              const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              if (lenisRef.current) {
                const distanceInViewports = Math.abs(section.getBoundingClientRect().top) / window.innerHeight;
                lenisRef.current.scrollTo("#projects", {
                  immediate: reduceMotion,
                  duration: Math.min(2.4, Math.max(1.1, distanceInViewports * 0.75)),
                  easing: (progress) => -(Math.cos(Math.PI * progress) - 1) / 2,
                });
              } else {
                section.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth" });
              }
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
