"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CameraScrollScene from "./CameraScrollScene";
import * as THREE from "three";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function CameraAnimationsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 0, 8]);
  const [cameraRotation, setCameraRotation] = useState<[number, number, number]>([0, 0, 0]);

  // Camera positions with scroll percentages
  const cameraPositions = [
    {
      name: "Front View",
      position: [0, 0, 8] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scrollPercent: 0, // 0% of section scroll
    },
    {
      name: "Side View",
      position: [8, 0, -5] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scrollPercent: 20, // 20% of section scroll
    },
    // Add more positions as needed
  ];

  useEffect(() => {
    if (!sectionRef.current || !scrollContentRef.current) return;

    const section = sectionRef.current;
    const scrollContent = scrollContentRef.current;

    // Create ScrollTrigger that tracks scroll progress within this section
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${scrollContent.offsetHeight}`,
      scrub: 1, // Smooth scrubbing (1 second lag for smoothness)
      onUpdate: (self) => {
        // Get scroll progress as percentage (0-100)
        const progress = self.progress * 100;

        // Find the two camera positions to interpolate between
        let startIndex = 0;
        let endIndex = cameraPositions.length - 1;

        for (let i = 0; i < cameraPositions.length - 1; i++) {
          if (
            progress >= cameraPositions[i].scrollPercent &&
            progress <= cameraPositions[i + 1].scrollPercent
          ) {
            startIndex = i;
            endIndex = i + 1;
            break;
          }
        }

        const startPos = cameraPositions[startIndex];
        const endPos = cameraPositions[endIndex];

        // Calculate interpolation factor (0-1) between the two positions
        const range =
          endPos.scrollPercent - startPos.scrollPercent || 1;
        const localProgress =
          (progress - startPos.scrollPercent) / range;
        const t = Math.max(0, Math.min(1, localProgress)); // Clamp between 0-1

        // Interpolate position
        const interpolatedPosition: [number, number, number] = [
          THREE.MathUtils.lerp(
            startPos.position[0],
            endPos.position[0],
            t
          ),
          THREE.MathUtils.lerp(
            startPos.position[1],
            endPos.position[1],
            t
          ),
          THREE.MathUtils.lerp(
            startPos.position[2],
            endPos.position[2],
            t
          ),
        ];

        // Interpolate rotation
        const interpolatedRotation: [number, number, number] = [
          THREE.MathUtils.lerp(
            startPos.rotation[0],
            endPos.rotation[0],
            t
          ),
          THREE.MathUtils.lerp(
            startPos.rotation[1],
            endPos.rotation[1],
            t
          ),
          THREE.MathUtils.lerp(
            startPos.rotation[2],
            endPos.rotation[2],
            t
          ),
        ];

        setCameraPosition(interpolatedPosition);
        setCameraRotation(interpolatedRotation);
      },
    });

    return () => {
      st.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Get current view name for display
  const getCurrentViewName = () => {
    // This is approximate - you could track it more precisely if needed
    return cameraPositions[0].name; // Will update based on scroll
  };

  return (
    <section ref={sectionRef} className="relative z-20 py-24 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Camera Movement
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Scroll within this section to see the camera smoothly move between different positions
          </p>
        </div>

        {/* Fixed 3D Canvas Container */}
        <div className="sticky top-20 h-[60vh] mb-32 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm">
          <CameraScrollScene
            cameraPosition={cameraPosition}
            cameraRotation={cameraRotation}
            className="w-full h-full"
          />
          
          {/* Current view indicator */}
          <div className="absolute top-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-lg border border-white/20">
            <p className="text-sm text-white">
              <span className="text-cyan-400">Scroll:</span> Camera Animation
            </p>
          </div>
        </div>

        {/* Scrollable content area - this creates the scroll distance for the section */}
        <div
          ref={scrollContentRef}
          className="h-[300vh]"
        >
          {/* This creates the scrollable space */}
          <div className="h-full" />
        </div>
      </div>
    </section>
  );
}
