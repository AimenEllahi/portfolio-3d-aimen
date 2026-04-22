"use client";

import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function CameraRig() {
  const { camera, scene } = useThree();
  const lookAtTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const progressRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const updateCamera = (progress: number) => {
      const easedProgress = THREE.MathUtils.smoothstep(progress, 0, 1);
      // Stronger forward range so movement is unmistakable.
      camera.position.set(0, 0, 8 - easedProgress * 9.4);
      lookAtTarget.set(0, 0, -1.8 - easedProgress * 1.2);
      camera.lookAt(lookAtTarget);

      const fadeT = easedProgress <= 0.75 ? 0 : (easedProgress - 0.65) / 0.25;
      const targetOpacity = 1 - fadeT * 0.65;
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh || !mesh.material) return;
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        materials.forEach((material) => {
          material.transparent = true;
          material.opacity = targetOpacity;
        });
      });
    };

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "+=2800",
      scrub: 1.2,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        updateCamera(self.progress);
      },
    });

    updateCamera(progressRef.current);

    return () => {
      trigger.kill();
    };
  }, [camera, lookAtTarget, scene]);

  return null;
}
