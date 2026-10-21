"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => {
    const count = 900;
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      array[i3] = (Math.random() - 0.5) * 20;
      array[i3 + 1] = (Math.random() - 0.5) * 10;
      array[i3 + 2] = (Math.random() - 0.5) * 20;
    }

    return array;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    pointsRef.current.rotation.y = t * 0.03;
    pointsRef.current.rotation.x = Math.sin(t * 0.15) * 0.04;

    if (materialRef.current) {
      materialRef.current.opacity = 0.26 + Math.sin(t * 22) * 0.04;
      materialRef.current.size = 0.016 + Math.sin(t * 16) * 0.003;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color="#8eb8ae"
        size={0.016}
        transparent
        opacity={0.26}
        depthWrite={false}
      />
    </points>
  );
}
