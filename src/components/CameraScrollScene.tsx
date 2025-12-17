"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";

// ============================================
// CAMERA CONTROLLER COMPONENT
// ============================================

interface CameraControllerProps {
  targetPosition: [number, number, number];
  targetRotation?: [number, number, number];
}

function CameraController({
  targetPosition,
  targetRotation,
}: CameraControllerProps) {
  const { camera } = useThree();
  const positionAnimRef = useRef<gsap.core.Tween | null>(null);
  const rotationAnimRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    // Kill any existing animations
    if (positionAnimRef.current) {
      positionAnimRef.current.kill();
    }
    if (rotationAnimRef.current) {
      rotationAnimRef.current.kill();
    }

    // Use GSAP to smoothly animate camera position
    positionAnimRef.current = gsap.to(camera.position, {
      x: targetPosition[0],
      y: targetPosition[1],
      z: targetPosition[2],
      duration: 0.3, // Smooth transition - adjust for responsiveness
      ease: "power2.out",
    });

    // Animate rotation if provided
    if (targetRotation) {
      rotationAnimRef.current = gsap.to(camera.rotation, {
        x: targetRotation[0],
        y: targetRotation[1],
        z: targetRotation[2],
        duration: 0.3,
        ease: "power2.out",
      });
    }

    return () => {
      if (positionAnimRef.current) {
        positionAnimRef.current.kill();
      }
      if (rotationAnimRef.current) {
        rotationAnimRef.current.kill();
      }
    };
  }, [camera, targetPosition, targetRotation]);

  return null;
}

// ============================================
// SIMPLE 3D MODEL (Placeholder - you can replace with your car model)
// ============================================

function SimpleModel() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      {/* Main object */}
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Additional objects for visual interest */}
      <mesh position={[-3, 0, 0]} castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 1.5, 32]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </group>
  );
}

// ============================================
// MAIN SCENE COMPONENT
// ============================================

interface CameraScrollSceneProps {
  cameraPosition: [number, number, number];
  cameraRotation?: [number, number, number];
  className?: string;
}

export default function CameraScrollScene({
  cameraPosition,
  cameraRotation,
  className = "",
}: CameraScrollSceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        camera={{
          position: cameraPosition,
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#4f46e5" />

        {/* Environment */}
        <Environment preset="city" />

        {/* Camera controller */}
        <CameraController
          targetPosition={cameraPosition}
          targetRotation={cameraRotation}
        />

        {/* 3D Model */}
        <SimpleModel />

        {/* Controls (disabled for scroll control, but can enable for manual control) */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
}
