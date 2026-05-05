"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Matches HeroSection scrub timing so zoom lines up with the name/M stencil zoom */
const HERO_TRIGGER_SELECTOR = "#home";

export default function CameraRig() {
  const { camera } = useThree();
  const lookAtTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const easeZoom = gsap.parseEase("power2.inOut");

    const updateCamera = (progress: number) => {
      const easedProgress = easeZoom(progress);
      camera.position.set(0, 0, 8 - easedProgress * 9.4);
      lookAtTarget.set(0, 0, -1.8 - easedProgress * 1.2);
      camera.lookAt(lookAtTarget);
    };

    let trigger: ScrollTrigger | null = null;
    let raf = 0;

    const attachWhenReady = () => {
      const el = document.querySelector<HTMLElement>(HERO_TRIGGER_SELECTOR);
      if (!el) {
        raf = requestAnimationFrame(attachWhenReady);
        return;
      }

      trigger = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          updateCamera(self.progress);
        },
      });

      updateCamera(trigger.progress);
      ScrollTrigger.refresh();
    };

    attachWhenReady();

    return () => {
      cancelAnimationFrame(raf);
      trigger?.kill();
    };
  }, [camera, lookAtTarget]);

  return null;
}
