"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";

type Props = {
  children: React.ReactNode;
};

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export default function SmoothScroll({ children }: Props) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const isMacLike = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
    if (isMacLike) {
      // Native scrolling is more reliable on Apple trackpads.
      setLenis(null);
      return;
    }

    const instance = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 1,
    });
    setLenis(instance);
    instance.start();

    const update = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
