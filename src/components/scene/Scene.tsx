"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import * as THREE from "three";
import GradientBackdrop from "@/components/scene/GradientBackdrop";
import HeroModel from "@/components/scene/HeroModel";
import FloatingParticles from "@/components/scene/FloatingParticles";
import CameraRig from "@/components/scene/CameraRig";

type SceneProps = {
  onReady?: () => void;
};

function RotatingDirectionalLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    lightRef.current.position.x = Math.sin(t * 0.4) * 5;
    lightRef.current.position.z = Math.cos(t * 0.4) * 5;
    lightRef.current.position.y = 2.8 + Math.sin(t * 0.25) * 0.7;
  });

  return <directionalLight ref={lightRef} intensity={0.42} color="#e8eae9" />;
}

/**
 * Signals once useLoader/useGLTF work is idle and synced (see drei's Progress store).
 */
function SceneReadyProbe({ onReady }: { onReady?: () => void }) {
  const { active, loaded, total } = useProgress();
  const fired = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useFrame(() => {
    if (fired.current) return;
    if (active) return;
    if (total > 0 && loaded >= total) {
      fired.current = true;
      queueMicrotask(() => {
        requestAnimationFrame(() => onReadyRef.current?.());
      });
    }
  });

  useEffect(() => {
    const failSafe = window.setTimeout(() => {
      if (!fired.current) {
        fired.current = true;
        onReadyRef.current?.();
      }
    }, 9000);
    return () => window.clearTimeout(failSafe);
  }, []);

  return null;
}

export default function Scene({ onReady }: SceneProps) {
  return (
    <Canvas
      camera={{ fov: 45, position: [0, 0, 8] }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100dvh",
        minHeight: "100dvh",
        zIndex: 5,
        pointerEvents: "none",
      }}
    >
      <SceneReadyProbe onReady={onReady} />
      <GradientBackdrop />
      <fog attach="fog" args={["#031a18", 11, 38]} />

      <ambientLight intensity={0.14} color="#aab8b4" />
      <RotatingDirectionalLight />
      <pointLight position={[0.5, 0.5, 2]} intensity={0.12} color="#5ec8b0" />
      <HeroModel />
      <FloatingParticles />
      <CameraRig />
    </Canvas>
  );
}
