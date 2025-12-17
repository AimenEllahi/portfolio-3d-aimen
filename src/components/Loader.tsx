"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Loader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate spinner rotation
    if (spinnerRef.current) {
      gsap.to(spinnerRef.current, {
        rotation: 360,
        duration: 1.5,
        ease: "none",
        repeat: -1,
      });
    }

    // Pulse animation for the loader
    if (loaderRef.current) {
      gsap.to(loaderRef.current, {
        opacity: 0.7,
        duration: 1,
        yoyo: true,
        repeat: -1,
        ease: "power2.inOut",
      });
    }
  }, []);

  return (
    <div
      ref={loaderRef}
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm z-50"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinning loader */}
        <div
          ref={spinnerRef}
          className="relative w-16 h-16"
        >
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full"></div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="text-white font-medium mb-1">Loading 3D Model</p>
          <p className="text-gray-400 text-sm">Please wait...</p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-cyan-500 rounded-full"
              style={{
                animation: `pulse 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
