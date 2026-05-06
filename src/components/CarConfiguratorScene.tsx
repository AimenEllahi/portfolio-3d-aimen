"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  PresentationControls,
} from "@react-three/drei";
import * as THREE from "three";
import { CarModel, CarPart, CarColors } from "./CarModel";

interface CarConfiguratorSceneProps {
  colors?: Partial<CarColors>;
  selectedPart?: CarPart | null;
  onPartClick?: (part: CarPart) => void;
  onPartHover?: (part: CarPart | null) => void;
  className?: string;
}

const SceneLoader = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
};

/** Reactive `isMobile` flag — re-evaluates on resize/orientation change. */
function useIsMobile(query = "(max-width: 639px)"): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return isMobile;
}

export function CarConfiguratorScene({
  colors,
  selectedPart,
  onPartClick,
  onPartHover,
  className = "",
}: CarConfiguratorSceneProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows={!isMobile}
        dpr={isMobile ? [1, 1] : [1, 2]}
        camera={{
          position: [5, 2, 5],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow={!isMobile}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        {!isMobile ? (
          <>
            <directionalLight
              position={[-5, 5, -5]}
              intensity={0.5}
              color="#4f46e5"
            />
            <pointLight position={[0, 10, 0]} intensity={0.5} color="#06b6d4" />
          </>
        ) : null}

        <Environment preset="city" />

        {!isMobile ? (
          <ContactShadows
            position={[0, -0.8, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={4}
          />
        ) : null}

        <Suspense fallback={<SceneLoader />}>
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

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={12}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={isMobile ? 0.6 : 1}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_ROTATE,
          }}
        />
      </Canvas>
    </div>
  );
}

export default CarConfiguratorScene;
