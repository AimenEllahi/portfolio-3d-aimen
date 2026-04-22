"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function CameraRig() {
  const { camera, scene } = useThree();
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const lookAtTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const currentLookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const wheelDistanceRef = useRef(0);
  const wheelVelocityRef = useRef(0);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      // Positive delta pushes camera forward; negative only slightly reverses.
      wheelVelocityRef.current += event.deltaY * 0.00045;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useFrame(() => {
    const scrollTop = Math.max(window.scrollY, document.documentElement.scrollTop, 0);
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    const scrollProgress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

    wheelVelocityRef.current *= 0.86;
    if (Math.abs(wheelVelocityRef.current) < 0.00001) {
      wheelVelocityRef.current = 0;
    }

    wheelDistanceRef.current = Math.min(
      Math.max(wheelDistanceRef.current + wheelVelocityRef.current, 0),
      1.2
    );

    // Monotonic forward motion: page scroll + wheel momentum.
    const forwardProgress = Math.min(scrollProgress * 0.7 + wheelDistanceRef.current, 1);

    // Forward-only camera travel on scroll.
    targetPosition.set(0, 0, 8 - forwardProgress * 5.2);
    lookAtTarget.set(0, 0, -1.8 - forwardProgress * 1.1);

    camera.position.lerp(targetPosition, 0.1);
    currentLookAt.lerp(lookAtTarget, 0.1);
    camera.lookAt(currentLookAt);

    const fadeT = scrollProgress <= 0.75 ? 0 : (scrollProgress - 0.75) / 0.25;
    const targetOpacity = 1 - fadeT * 0.65;
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity += (targetOpacity - material.opacity) * 0.05;
      });
    });
  });

  return null;
}
