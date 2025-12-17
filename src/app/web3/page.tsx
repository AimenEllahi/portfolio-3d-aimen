"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import SolidityDemo from "@/components/SolidityDemo";

export default function Web3Page() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animations
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      titleRef.current,
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
        demoRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.4"
      );
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1
              ref={titleRef}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 opacity-0"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                Web3 & Blockchain
              </span>
            </h1>
            <p
              ref={subtitleRef}
              className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto opacity-0"
            >
              Building decentralized applications, smart contracts, and Web3
              experiences. Specializing in Solidity development, DeFi
              integrations, and blockchain frontend development.
            </p>
          </div>

          {/* Capabilities Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: "📜",
                title: "Smart Contracts",
                description:
                  "Solidity development, testing, and deployment on Ethereum and EVM-compatible chains.",
              },
              {
                icon: "💎",
                title: "DeFi Integration",
                description:
                  "Building DeFi protocols, token swaps, staking, and yield farming interfaces.",
              },
              {
                icon: "🌐",
                title: "Web3 Frontend",
                description:
                  "Wallet connections, transaction handling, and seamless blockchain interactions.",
              },
            ].map((capability, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="text-3xl mb-3">{capability.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {capability.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>

          {/* Solidity Demo Section */}
          <div ref={demoRef} className="opacity-0">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Solidity Demo
              </span>
            </h2>
            <SolidityDemo />
          </div>
        </div>
      </section>
    </div>
  );
}
