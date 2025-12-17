"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  PresentationControls,
} from "@react-three/drei";
import { CarModel, CarPart, CarColors } from "./CarModel";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface CarConfiguratorSceneProps {
  colors?: Partial<CarColors>;
  selectedPart?: CarPart | null;
  onPartClick?: (part: CarPart) => void;
  onPartHover?: (part: CarPart | null) => void;
  className?: string;
}

// Loading fallback component
const Loader = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export function CarConfiguratorScene({
  colors,
  selectedPart,
  onPartClick,
  onPartHover,
  className = "",
}: CarConfiguratorSceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        camera={{
          position: [5, 2, 5],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#4f46e5" />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#06b6d4" />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* Ground shadow */}
        <ContactShadows
          position={[0, -0.8, 0]}
          opacity={0.5}
          scale={10}
          blur={2}
          far={4}
        />

        {/* Car model with suspense for loading */}
        <Suspense fallback={<Loader />}>
          <PresentationControls
            global
            zoom={0.8}
            rotation={[0, -Math.PI / 6, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <CarModel
              colors={colors}
              selectedPart={selectedPart}
              onPartClick={onPartClick}
              onPartHover={onPartHover}
            />
          </PresentationControls>
        </Suspense>

        {/* Orbit controls for user interaction */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={12}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}

export default CarConfiguratorScene;
