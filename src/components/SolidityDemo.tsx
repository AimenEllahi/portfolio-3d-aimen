"use client";

import { useState } from "react";

/**
 * SolidityDemo Component
 * 
 * Placeholder component for showcasing Solidity code examples.
 * Content to be decided and implemented later.
 */
export default function SolidityDemo() {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-8 backdrop-blur-sm">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
        {[
          { id: "overview", label: "Overview" },
          { id: "code", label: "Code Examples" },
          { id: "demo", label: "Live Demo" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              Solidity Development Capabilities
            </h3>
            <div className="space-y-3 text-gray-300">
              <p>
                I specialize in developing smart contracts using Solidity for
                Ethereum and EVM-compatible blockchains. My expertise includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ERC-20, ERC-721, and ERC-1155 token standards</li>
                <li>DeFi protocol development (DEX, lending, staking)</li>
                <li>Gas optimization and security best practices</li>
                <li>Testing with Hardhat and Foundry</li>
                <li>Frontend integration with ethers.js and viem</li>
              </ul>
              <p className="pt-4 text-gray-400 italic">
                Code examples and live demos coming soon...
              </p>
            </div>
          </div>
        )}

        {activeTab === "code" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              Code Examples
            </h3>
            <div className="bg-black/40 rounded-lg p-6 border border-white/10">
              <p className="text-gray-400 text-center py-8">
                Solidity code examples will be displayed here.
              </p>
            </div>
          </div>
        )}

        {activeTab === "demo" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              Interactive Demo
            </h3>
            <div className="bg-black/40 rounded-lg p-6 border border-white/10">
              <p className="text-gray-400 text-center py-8">
                Interactive Solidity demo will be implemented here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
