"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import CameraAnimationsSection from "@/components/CameraAnimationsSection";

export default function Home() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animations
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      headlineRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1 }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.5"
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.4"
      );
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 z-10 pointer-events-none" />

        {/* Hero Content - Centered */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <h1
            ref={headlineRef}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 opacity-0"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Crafting Digital
            </span>
            <br />
            <span className="text-white">Experiences</span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto opacity-0"
          >
            Specializing in immersive 3D web experiences, interactive
            configurators, and cutting-edge React development.
          </p>

          <div ref={ctaRef} className="flex flex-wrap justify-center gap-4 opacity-0">
            <a
              href="/projects"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105"
            >
              View Projects
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
            <a
              href="/configurator"
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              Try 3D Configurator
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 -translate-x-1/2 z-20 animate-bounce">
          <div className="flex flex-col items-center text-white/60">
            <span className="text-sm mb-2">Scroll to explore</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              What I Build
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🎮",
                title: "3D Configurators",
                description:
                  "Interactive product configurators with real-time customization using Three.js and React Three Fiber.",
              },
              {
                icon: "⚡",
                title: "Modern Web Apps",
                description:
                  "High-performance applications built with Next.js, TypeScript, and modern best practices.",
              },
              {
                icon: "✨",
                title: "Immersive Animations",
                description:
                  "Stunning motion design and scroll-triggered animations using GSAP and CSS.",
              },
              {
                icon: "🔗",
                title: "Web3 & Blockchain",
                description:
                  "Smart contract development with Solidity, DeFi integrations, and Web3 frontend development.",
                link: "/web3",
              },
            ].map((feature, index) => {
              const content = (
                <>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </>
              );

              return feature.link ? (
                <a
                  key={index}
                  href={feature.link}
                  className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 block"
                >
                  {content}
                </a>
              ) : (
                <div
                  key={index}
                  className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Camera Animations Showcase */}
      <CameraAnimationsSection />
    </div>
  );
}
