"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
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

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const syncScrollToTop = (lenis: Lenis) => {
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
    };

    const instance = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1,
      wheelMultiplier: 1,
      naiveDimensions: true,
    });

    setLenis(instance);
    instance.start();
    syncScrollToTop(instance);

    const syncLenisWithGsap = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(syncLenisWithGsap);
    gsap.ticker.lagSmoothing(0);

    const onScroll = () => ScrollTrigger.update();
    instance.on("scroll", onScroll);

    const onStRefresh = () => {
      instance.resize();
    };
    ScrollTrigger.addEventListener("refresh", onStRefresh);

    const refreshFromTop = () => {
      syncScrollToTop(instance);
      ScrollTrigger.refresh();
      instance.resize();
    };

    requestAnimationFrame(() => {
      refreshFromTop();
      requestAnimationFrame(refreshFromTop);
    });

    const onLoad = () => {
      refreshFromTop();
      requestAnimationFrame(() => {
        refreshFromTop();
        window.setTimeout(() => refreshFromTop(), 50);
      });
    };
    if (document.readyState === "complete") {
      queueMicrotask(onLoad);
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      window.removeEventListener("load", onLoad);
      ScrollTrigger.removeEventListener("refresh", onStRefresh);
      instance.off("scroll", onScroll);
      gsap.ticker.remove(syncLenisWithGsap);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      <div id="smooth-wrapper">{children}</div>
    </LenisContext.Provider>
  );
}
