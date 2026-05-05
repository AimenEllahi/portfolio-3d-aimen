"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const { positions, basePositions } = useMemo(() => {
    const count = 900;
    const array = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      array[i3] = (Math.random() - 0.5) * 20;
      array[i3 + 1] = (Math.random() - 0.5) * 10;
      array[i3 + 2] = (Math.random() - 0.5) * 20;
      base[i3] = array[i3];
      base[i3 + 1] = array[i3 + 1];
      base[i3 + 2] = array[i3 + 2];
    }

    return { positions: array, basePositions: base };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    pointsRef.current.rotation.y = t * 0.03;
    pointsRef.current.rotation.x = Math.sin(t * 0.15) * 0.04;

    const geometry = pointsRef.current.geometry;
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < attr.count; i += 1) {
      const i3 = i * 3;
      attr.array[i3] = basePositions[i3] + Math.sin(t * 3.2 + i * 0.31) * 0.008;
      attr.array[i3 + 1] =
        basePositions[i3 + 1] + Math.cos(t * 2.8 + i * 0.17) * 0.014;
      attr.array[i3 + 2] = basePositions[i3 + 2] + Math.sin(t * 2.4 + i * 0.21) * 0.01;
    }
    attr.needsUpdate = true;

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
