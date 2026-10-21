"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.normalizeScroll(false);

type LenisContextValue = Lenis | null;

export const LenisContext = createContext<LenisContextValue>(null);

export function useLenis() {
  return useContext(LenisContext);
}

type SmoothScrollProviderProps = {
  children: ReactNode;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const instance = new Lenis({
      duration: 1.2,
      smoothWheel: !isTouchDevice && !reduceMotion,
      syncTouch: false,
      wheelMultiplier: 1,
      naiveDimensions: true,
    });

    setLenis(instance);
    instance.start();

    const syncLenisWithGsap = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(syncLenisWithGsap);

    const onScroll = () => ScrollTrigger.update();
    instance.on("scroll", onScroll);

    const onStRefresh = () => {
      instance.resize();
    };
    ScrollTrigger.addEventListener("refresh", onStRefresh);

    const initialHash = window.location.hash;
    let initialHashChecks = 0;

    const refreshLayout = () => {
      ScrollTrigger.refresh();
      instance.resize();
      if (initialHash && initialHashChecks < 2) {
        initialHashChecks += 1;
        let targetId = initialHash.slice(1);
        try { targetId = decodeURIComponent(targetId); } catch { /* keep raw hash */ }
        const target = document.getElementById(targetId);
        if (target) instance.scrollTo(target, { immediate: true });
      }
    };

    const initialFrame = requestAnimationFrame(refreshLayout);
    const hashTimer = initialHash ? window.setTimeout(refreshLayout, 300) : 0;
    const onLoad = () => requestAnimationFrame(refreshLayout);
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      window.removeEventListener("load", onLoad);
      cancelAnimationFrame(initialFrame);
      if (hashTimer) window.clearTimeout(hashTimer);
      ScrollTrigger.removeEventListener("refresh", onStRefresh);
      instance.off("scroll", onScroll);
      gsap.ticker.remove(syncLenisWithGsap);
      instance.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      <div id="smooth-wrapper">{children}</div>
    </LenisContext.Provider>
  );
}
