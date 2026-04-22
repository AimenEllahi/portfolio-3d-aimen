"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import HeroModel from "@/components/scene/HeroModel";
import FloatingParticles from "@/components/scene/FloatingParticles";
import CameraRig from "@/components/scene/CameraRig";

function RotatingDirectionalLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    lightRef.current.position.x = Math.sin(t * 0.4) * 5;
    lightRef.current.position.z = Math.cos(t * 0.4) * 5;
    lightRef.current.position.y = 2.8 + Math.sin(t * 0.25) * 0.7;
  });

  return <directionalLight ref={lightRef} intensity={0.9} color="#f5f5f5" />;
}

export default function Scene() {
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
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <color attach="background" args={["#0a0a0d"]} />
      <ambientLight intensity={0.35} color="#f2f2f2" />
      <RotatingDirectionalLight />
      <pointLight position={[0, 0, 2]} intensity={0.22} color="#d9d9d9" />
      <HeroModel />
      <FloatingParticles />
      <CameraRig />
    </Canvas>
  );
}
