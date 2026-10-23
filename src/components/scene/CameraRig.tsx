"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { heroPinDistanceVhForWidth } from "@/lib/heroMotion";

/** Matches HeroSection scrub timing so zoom lines up with the name/M stencil zoom */
const HERO_TRIGGER_SELECTOR = "#home";

export default function CameraRig() {
  const { camera } = useThree();
  const lookAtTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const easeZoom = gsap.parseEase("power4.in");

    let heroProgress = 0;
    let projectsProgress = 0;
    const updateCamera = () => {
      const zoom = easeZoom(heroProgress);
      const returnToModel = gsap.parseEase("power2.out")(projectsProgress);
      camera.position.set(0, 0, 8 - zoom * 9.4 * (1 - returnToModel));
      lookAtTarget.set(0, 0, -1.8 - zoom * 1.2 * (1 - returnToModel));
      camera.lookAt(lookAtTarget);
    };

    let heroTrigger: ScrollTrigger | null = null;
    let projectsTrigger: ScrollTrigger | null = null;
    let raf = 0;

    const attachWhenReady = () => {
      const el = document.querySelector<HTMLElement>(HERO_TRIGGER_SELECTOR);
      if (!el) {
        raf = requestAnimationFrame(attachWhenReady);
        return;
      }

      heroTrigger = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${window.innerHeight * (heroPinDistanceVhForWidth(window.innerWidth) / 100)}`,
        scrub: 0.4,
        onUpdate: (self) => {
          heroProgress = self.progress;
          updateCamera();
        },
      });

      const projects = document.getElementById("projects");
      if (projects) {
        projectsTrigger = ScrollTrigger.create({
          trigger: projects,
          start: () => window.innerWidth < 768 ? "top 50%" : "top 40%",
          end: "top 5%",
          scrub: 0.4,
          onUpdate: (self) => {
            projectsProgress = self.progress;
            updateCamera();
          },
        });
        projectsProgress = projectsTrigger.progress;
      }
      heroProgress = heroTrigger.progress;
      updateCamera();
      ScrollTrigger.refresh();
    };

    attachWhenReady();

    return () => {
      cancelAnimationFrame(raf);
      heroTrigger?.kill();
      projectsTrigger?.kill();
    };
  }, [camera, lookAtTarget]);

  return null;
}
