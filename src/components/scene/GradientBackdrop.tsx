"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  createHeroEnvUniforms,
  HERO_ENV_FRAGMENT_SHADER,
  HERO_ENV_VERTEX_SHADER,
} from "@/components/HeroShader";

/**
 * Animated procedural environment dome — matches `HeroShader.tsx` uniforms + fragment.
 */
export default function GradientBackdrop() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const uniforms = useMemo(() => createHeroEnvUniforms(), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.set(
        e.clientX / Math.max(window.innerWidth, 1),
        e.clientY / Math.max(window.innerHeight, 1),
      );
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const { gl } = useThree();

  useFrame(({ clock }) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value = clock.elapsedTime;
    m.uniforms.uResolution.value.set(
      gl.domElement.width,
      gl.domElement.height,
    );
    m.uniforms.uMouse.value.copy(mouseRef.current);

    let scrollNorm = 0;
    if (typeof window !== "undefined") {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      scrollNorm = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
    }
    m.uniforms.uScrollY.value = scrollNorm;
  });

  return (
    <mesh scale={[140, 140, 140]} rotation={[0, 0.85, 0]}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={HERO_ENV_VERTEX_SHADER}
        fragmentShader={HERO_ENV_FRAGMENT_SHADER}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        toneMapped
      />
    </mesh>
  );
}
