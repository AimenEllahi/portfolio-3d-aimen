"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import CarConfiguratorScene from "@/components/CarConfiguratorScene";
import Loader from "@/components/Loader";
import { CarPart } from "@/components/CarModel";
import {
  useConfiguratorStore,
  ConfigurablePart,
} from "@/store/configuratorStore";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ColorOption {
  id: string;
  name: string;
  value: string;
}

// ============================================
// CONFIGURATION DATA
// ============================================

const colorOptions: ColorOption[] = [
  { id: "racing-red", name: "Racing Red", value: "#dc2626" },
  { id: "ocean-blue", name: "Ocean Blue", value: "#2563eb" },
  { id: "midnight-navy", name: "Midnight Navy", value: "#1e3a5f" },
  { id: "pearl-white", name: "Pearl White", value: "#f8fafc" },
  { id: "carbon-black", name: "Carbon Black", value: "#18181b" },
  { id: "emerald", name: "Emerald Green", value: "#059669" },
  { id: "sunset-orange", name: "Sunset Orange", value: "#ea580c" },
  { id: "royal-purple", name: "Royal Purple", value: "#7c3aed" },
  { id: "gold", name: "Champagne Gold", value: "#d4af37" },
  { id: "silver", name: "Silver Metallic", value: "#C0C0C0" },
  { id: "british-green", name: "British Racing Green", value: "#004225" },
  { id: "papaya", name: "Papaya Orange", value: "#FF5F1F" },
];

interface PartConfigItem {
  id: ConfigurablePart;
  name: string;
  icon: string;
  description: string;
}

const partConfigs: PartConfigItem[] = [
  {
    id: "body",
    name: "Body",
    icon: "🚗",
    description: "Main body panels and exterior",
  },
  {
    id: "accents",
    name: "Accents",
    icon: "✨",
    description: "Racing stripes and accent lines",
  },
  {
    id: "wheels",
    name: "Wheels",
    icon: "⚙️",
    description: "Rims and wheel components",
  },
  {
    id: "interior",
    name: "Interior",
    icon: "🪑",
    description: "Seats and interior trim",
  },
  {
    id: "windows",
    name: "Windows",
    icon: "🪟",
    description: "Window tint color",
  },
  {
    id: "chrome",
    name: "Chrome",
    icon: "💎",
    description: "Chrome and metallic accents",
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function ConfiguratorPage() {
  const {
    partColors,
    selectedPart,
    hoveredPart,
    activePanel,
    setPartColor,
    setSelectedPart,
    setHoveredPart,
    setActivePanel,
    resetColors,
  } = useConfiguratorStore();

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Refs for GSAP animations
  const pageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animations
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      viewerRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8 }
    ).fromTo(
      panelRef.current,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.6 },
      "-=0.4"
    );
  }, []);

  // Simulate model loading (you can replace this with actual loading detection)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 second delay to show loader

    return () => clearTimeout(timer);
  }, []);

  // Handler functions
  const handlePartSelect = (part: ConfigurablePart) => {
    setSelectedPart(part);
    // Animate color selection when part changes
    gsap.fromTo(
      ".color-grid",
      { opacity: 0.5, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  };

  const handleColorChange = (color: string) => {
    if (!selectedPart) return;
    setPartColor(selectedPart, color);

    // Flash animation feedback
    gsap.fromTo(
      viewerRef.current,
      { boxShadow: "0 0 0 0 rgba(6, 182, 212, 0)" },
      {
        boxShadow: "0 0 30px 10px rgba(6, 182, 212, 0.3)",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      }
    );
  };

  const handlePartClick = (part: CarPart) => {
    // Only set as selected if it's a configurable part
    const configurableParts: ConfigurablePart[] = ["body", "accents", "wheels", "interior", "windows", "chrome"];
    if (configurableParts.includes(part as ConfigurablePart)) {
      setSelectedPart(part as ConfigurablePart);
      setActivePanel("colors");
    }
  };

  const handlePartHover = (part: CarPart | null) => {
    setHoveredPart(part);
  };

  const togglePanel = (panelId: string) => {
    setActivePanel(activePanel === panelId ? "" : panelId);
  };

  const handleResetColors = () => {
    resetColors();
    gsap.fromTo(
      viewerRef.current,
      { scale: 1 },
      { scale: 1.02, duration: 0.2, yoyo: true, repeat: 1 }
    );
  };

  // Get current part config
  const currentPartConfig = partConfigs.find((p) => p.id === selectedPart);

  return (
    <div ref={pageRef} className="min-h-screen py-20 bg-[#050508] text-white">
      {/* Page Header */}
      <div className="px-6 py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-[#6ee7f7] to-[#a855f7] bg-clip-text text-transparent">
              3D Car Configurator
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Click on car parts or select below to customize • Drag to rotate •
            Scroll to zoom
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 3D Viewer - Takes 2/3 of space on large screens */}
          <div
            ref={viewerRef}
            className="lg:col-span-2 aspect-[4/3] lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0d0d14]/90 to-[#050508]/90 backdrop-blur-sm opacity-0 relative"
          >
            {isLoading && <Loader />}
            <CarConfiguratorScene
              colors={partColors}
              selectedPart={selectedPart}
              onPartClick={handlePartClick}
              onPartHover={handlePartHover}
            />

            {/* Hovered part indicator */}
            {hoveredPart && (
              <div className="absolute top-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-lg border border-white/20">
                <p className="text-sm text-white">
                  <span className="text-cyan-400">Hover:</span>{" "}
                  {partConfigs.find((p) => p.id === hoveredPart)?.name}
                </p>
              </div>
            )}

            {/* Selected part indicator */}
            {selectedPart && (
              <div className="absolute bottom-4 left-4 px-4 py-2 bg-[#6ee7f7]/15 backdrop-blur-sm rounded-lg border border-[#6ee7f7]/40">
                <p className="text-sm text-white">
                  <span className="text-[#6ee7f7]">Editing:</span>{" "}
                  {currentPartConfig?.name}
                </p>
              </div>
            )}

            {/* Controls hint */}
            <div className="absolute bottom-4 right-4 text-xs text-white/40">
              🖱️ Drag to rotate • 🔍 Scroll to zoom
            </div>
          </div>

          {/* Configuration Panel - Takes 1/3 of space */}
          <div ref={panelRef} className="space-y-4 lg:h-[600px] h-full overflow-y-auto opacity-0">
            {/* Part Selection Panel */}
            <ConfigPanel
              title="Select Part"
              icon="🔧"
              isOpen={activePanel === "parts"}
              onToggle={() => togglePanel("parts")}
            >
              <div className="grid grid-cols-2 gap-2">
                {partConfigs.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => handlePartSelect(part.id)}
                    className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                      selectedPart === part.id
                        ? "border-[#6ee7f7] bg-[#6ee7f7]/15 scale-[1.02]"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{part.icon}</span>
                      <div>
                        <p className="font-medium text-white text-sm">
                          {part.name}
                        </p>
                        <div
                          className="w-4 h-4 rounded-full mt-1 border border-white/20"
                          style={{ backgroundColor: partColors[part.id] }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ConfigPanel>

            {/* Color Selection Panel */}
            <ConfigPanel
              title={`${currentPartConfig?.name || "Part"} Color`}
              icon="🎨"
              isOpen={activePanel === "colors"}
              onToggle={() => togglePanel("colors")}
            >
              {selectedPart ? (
                <>
                  <p className="text-sm text-gray-400 mb-3">
                    {currentPartConfig?.description}
                  </p>
                  <div className="color-grid grid grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleColorChange(color.value)}
                        className={`group relative w-full aspect-square rounded-xl border-2 transition-all duration-300 hover:scale-110 ${
                          partColors[selectedPart] === color.value
                            ? "border-white shadow-lg shadow-white/20 scale-110"
                            : "border-white/20 hover:border-white/40"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        aria-label={`Select ${color.name}`}
                      >
                        {partColors[selectedPart] === color.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-white drop-shadow-lg"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        {/* Tooltip on hover */}
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
                    Selected:{" "}
                    <span className="text-white font-medium">
                      {colorOptions.find(
                        (c) => c.value === partColors[selectedPart]
                      )?.name || "Custom"}
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-gray-400 text-sm">
                  Select a part above to change its color
                </p>
              )}
            </ConfigPanel>

            {/* Configuration Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0d0d14]/95 to-[#050508]/95 border border-white/10 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <span>📋</span> Configuration Summary
              </h3>
              <div className="space-y-3 text-sm mb-6">
                {partConfigs.map((part) => (
                  <div key={part.id} className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-2">
                      <span>{part.icon}</span>
                      {part.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20"
                        style={{ backgroundColor: partColors[part.id] }}
                      />
                      <span className="text-white text-xs">
                        {colorOptions.find((c) => c.value === partColors[part.id])
                          ?.name || "Custom"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <button className="w-full py-4 bg-gradient-to-r from-[#6ee7f7] to-[#a855f7] text-[#050508] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#6ee7f7]/25 transition-all duration-300 hover:scale-[1.02]">
                  Request Quote
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleResetColors}
                    className="py-3 border border-white/20 text-white/80 font-medium rounded-xl hover:bg-white/5 transition-all duration-300"
                  >
                    Reset
                  </button>
                  <button className="py-3 border border-[#6ee7f7]/40 text-[#6ee7f7] font-medium rounded-xl hover:bg-[#6ee7f7]/10 transition-all duration-300">
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#6ee7f7]/10 to-[#a855f7]/10 border border-[#6ee7f7]/20">
              <p className="text-sm text-[#e2fbff]">
                <span className="font-semibold">💡 Tip:</span> Click directly on
                car parts in the 3D view to select them for customization!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface ConfigPanelProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <div className="rounded-2xl bg-[#0d0d14]/90 border border-white/10 overflow-hidden backdrop-blur-sm">
      {/* Panel Header - Clickable on mobile */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 lg:cursor-default"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold text-white">{title}</span>
        </div>
        <svg
          className={`w-5 h-5 text-white/60 lg:hidden transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Panel Content */}
      <div
        className={`px-4 pb-4 transition-all duration-300  lg:block ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
};
