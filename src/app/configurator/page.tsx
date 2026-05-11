"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import CarConfiguratorScene from "@/components/CarConfiguratorScene";
import Loader from "@/components/Loader";
import Navbar from "@/components/ui/Navbar";
import { CarPart } from "@/components/CarModel";
import {
  useConfiguratorStore,
  ConfigurablePart,
} from "@/store/configuratorStore";
interface ColorOption {
  id: string;
  name: string;
  value: string;
}

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

  const [isLoading, setIsLoading] = useState(true);
  const [showPalette, setShowPalette] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 639px)").matches;

    if (isMobile) {
      gsap.fromTo(
        viewerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out" },
      );
      gsap.fromTo(
        mobilePanelRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power2.out" },
      );
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      viewerRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8 },
    ).fromTo(
      panelRef.current,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.6 },
      "-=0.4",
    );
    gsap.fromTo(
      mobilePanelRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 },
    );
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  // local UI state

  const handlePartSelect = (part: ConfigurablePart) => {
    setSelectedPart(part);
    setActivePanel("colors");
    gsap.fromTo(
      ".color-grid",
      { opacity: 0.5, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
    );
  };

  const handleColorChange = (color: string) => {
    if (!selectedPart) return;
    setPartColor(selectedPart, color);

    gsap.fromTo(
      viewerRef.current,
      { boxShadow: "0 0 0 0 rgba(110, 240, 200, 0)" },
      {
        boxShadow: "0 0 30px 10px rgba(110, 240, 200, 0.3)",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      },
    );
  };

  const handlePartClick = (part: CarPart) => {
    const configurableParts: ConfigurablePart[] = [
      "body",
      "accents",
      "wheels",
      "interior",
      "windows",
      "chrome",
    ];
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
      { scale: 1.02, duration: 0.2, yoyo: true, repeat: 1 },
    );
  };

  // Palette toggle handlers (floating palette)
  const togglePalette = () => setShowPalette((s) => !s);

  // Close palette on Escape
  useEffect(() => {
    if (!showPalette) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPalette(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPalette]);

  const currentPartConfig = partConfigs.find((p) => p.id === selectedPart);

  return (
    <div
      ref={pageRef}
      className="min-h-dvh bg-[var(--bg)] text-[var(--fg)] lg:min-h-screen lg:py-20"
    >
      <Navbar />

      {/* Header */}
      <div className="border-b border-white/[0.06] px-4 pb-5 pt-24 sm:px-6 sm:pb-6 sm:pt-28 lg:border-white/10 lg:px-6 lg:py-8 lg:pt-8">
        <div className="lg:mx-auto lg:max-w-7xl">
          <h1 className="mb-1 text-xl font-bold text-white sm:text-2xl lg:mb-2 lg:text-3xl xl:text-4xl">
            3D Car Configurator
          </h1>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] sm:text-xs sm:tracking-[0.14em] lg:text-lg lg:normal-case lg:tracking-normal">
            Click parts to customize
            <span className="hidden sm:inline">
              {" "}
              • Drag to rotate • Scroll to zoom
            </span>
          </p>
        </div>
      </div>

      {/* Main grid wrapper. Desktop layout fully preserved at lg+. */}
      <div className="lg:mx-auto lg:max-w-7xl lg:px-6 lg:py-8">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-3 lg:gap-8">
          {/* Viewer — single instance, responsive container.
              Mobile/Tablet: flush full-width with bottom border.
              Desktop: rounded card inside grid (col-span-2). */}
          <div
            ref={viewerRef}
            className="relative h-[52vh] min-h-[260px] max-h-[420px] w-full overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-[var(--surface)]/90 to-[var(--bg)]/90 opacity-0 sm:h-[55vh] sm:max-h-[520px] lg:col-span-2 lg:aspect-auto lg:h-[600px] lg:max-h-none lg:rounded-2xl lg:border lg:border-white/10 lg:backdrop-blur-sm"
          >
            {isLoading && <Loader />}
            <CarConfiguratorScene
              colors={partColors}
              selectedPart={selectedPart}
              onPartClick={handlePartClick}
              onPartHover={handlePartHover}
            />

            {/* Floating palette toggle button */}
            <div className="absolute right-4 bottom-4 z-[30] flex items-end">
              <button
                aria-expanded={showPalette}
                aria-controls="floating-palette"
                onClick={() => {
                  if (!selectedPart) {
                    // pulse mobile panel and show tooltip
                    if (mobilePanelRef.current) {
                      gsap.fromTo(
                        mobilePanelRef.current,
                        { boxShadow: "0 0 0 0 rgba(110,240,200,0)" },
                        { boxShadow: "0 0 0 2px rgba(110,240,200,0.4)", duration: 0.3, yoyo: true, repeat: 1 },
                      );
                    }
                    // show a temporary tooltip
                    const tip = document.createElement("div");
                    tip.textContent = "Select a part first";
                    tip.className = "pointer-events-none absolute -top-12 right-0 rounded-full bg-black/70 px-3 py-1 text-xs text-white/90";
                    const container = document.createElement("div");
                    container.style.position = "relative";
                    document.body.appendChild(tip);
                    setTimeout(() => tip.remove(), 1500);
                    return;
                  }
                  togglePalette();
                }}
                className={`pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full text-black shadow-lg hover:scale-105 active:scale-95 transition-transform ${
                  selectedPart ? "bg-[var(--accent)]/95" : "bg-[var(--accent)]/40"
                }`}
                title={selectedPart ? "Open color palette" : "Select a part first"}
              >
                <span className="text-xl">🎨</span>
              </button>
            </div>

            {/* Floating palette overlay */}
            {showPalette && (
              <div
                role="dialog"
                aria-modal="true"
                id="floating-palette"
                className="fixed inset-0 z-[40] flex items-end justify-end"
                onClick={() => setShowPalette(false)}
              >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                {/* Panel (click stops propagation) */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative m-4 max-h-[70vh] w-[320px] rounded-2xl bg-[var(--surface)]/95 border border-white/10 p-4 shadow-2xl overflow-auto"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-white">Colors</h4>
                    <button
                      aria-label="Close palette"
                      onClick={() => setShowPalette(false)}
                      className="text-white/60 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {selectedPart ? (
                    <>
                      <p className="text-sm text-[var(--muted)] mb-3">
                        {currentPartConfig?.description}
                      </p>
                      <div className="grid grid-cols-4 gap-3">
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
                          </button>
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-[var(--muted)]">
                        Selected: <span className="text-white font-medium">
                          {colorOptions.find((c) => c.value === partColors[selectedPart])?.name || "Custom"}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-[var(--muted)] text-sm">Select a part to change its color</p>
                  )}
                </div>
              </div>
            )}

            {/* LIVE PREVIEW pill — mobile + tablet only */}
            <div className="pointer-events-none absolute left-3 top-3 z-[2] sm:left-4 sm:top-4 lg:hidden">
              <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.22em] text-white/60 backdrop-blur-md sm:text-[10px]">
                Live Preview
              </span>
            </div>

            {/* Hovered part indicator */}
            {hoveredPart && (
              <div className="absolute left-4 top-4 hidden rounded-lg border border-white/20 bg-black/60 px-4 py-2 backdrop-blur-sm lg:block">
                <p className="text-sm text-white">
                  <span className="text-[var(--accent)]">Hover:</span>{" "}
                  {partConfigs.find((p) => p.id === hoveredPart)?.name}
                </p>
              </div>
            )}

            {/* Hovered indicator on tablet */}
            {hoveredPart && (
              <div className="absolute right-4 top-4 z-[2] hidden rounded-full border border-white/10 bg-black/55 px-3 py-1 backdrop-blur-md sm:block lg:hidden">
                <span className="text-[11px] text-white/85">
                  <span className="text-[var(--accent)]">Hover:</span>{" "}
                  {partConfigs.find((p) => p.id === hoveredPart)?.name}
                </span>
              </div>
            )}

            {/* Selected indicator — desktop original */}
            {selectedPart && (
              <div className="absolute bottom-4 left-4 hidden rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-4 py-2 backdrop-blur-sm lg:block">
                <p className="text-sm text-white">
                  <span className="text-[var(--accent)]">Editing:</span>{" "}
                  {currentPartConfig?.name}
                </p>
              </div>
            )}

            {/* Selected indicator — mobile + tablet */}
            {selectedPart && (
              <div className="absolute bottom-3 left-3 z-[2] rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-2.5 py-1 backdrop-blur-sm sm:bottom-4 sm:left-4 sm:px-3 sm:py-1.5 lg:hidden">
                <span className="block text-[8px] font-medium uppercase tracking-[0.2em] text-[var(--accent)] sm:text-[10px]">
                  Editing
                </span>
                <span className="block text-[12px] font-medium text-white sm:text-sm">
                  {currentPartConfig?.name}
                </span>
              </div>
            )}

            {/* Camera hint — hidden on mobile, visible on tablet & desktop */}
            <div className="absolute bottom-4 right-4 hidden text-xs text-white/40 sm:block">
              🖱️ Drag to rotate • 🔍 Scroll to zoom
            </div>
          </div>

          {/* Desktop panel — UNCHANGED original markup */}
          <div
            ref={panelRef}
            className="hidden lg:col-span-1 lg:block lg:h-[600px] lg:space-y-4 lg:overflow-y-auto lg:opacity-0"
          >
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
                        ? "border-[var(--accent)] bg-[var(--accent)]/15 scale-[1.02]"
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
                  <p className="text-sm text-[var(--muted)] mb-3">
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
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-[var(--muted)]">
                    Selected:{" "}
                    <span className="text-white font-medium">
                      {colorOptions.find(
                        (c) => c.value === partColors[selectedPart],
                      )?.name || "Custom"}
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-[var(--muted)] text-sm">
                  Select a part above to change its color
                </p>
              )}
            </ConfigPanel>

            {/* Configuration Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--surface)]/95 to-[var(--bg)]/95 border border-white/10 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <span>📋</span> Configuration Summary
              </h3>
              <div className="space-y-3 text-sm mb-6">
                {partConfigs.map((part) => (
                  <div
                    key={part.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[var(--muted)] flex items-center gap-2">
                      <span>{part.icon}</span>
                      {part.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20"
                        style={{ backgroundColor: partColors[part.id] }}
                      />
                      <span className="text-white text-xs">
                        {colorOptions.find(
                          (c) => c.value === partColors[part.id],
                        )?.name || "Custom"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <button className="w-full py-4 bg-gradient-to-r from-[var(--accent)] to-[var(--violet)] text-[var(--bg)] font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--accent)]/25 transition-all duration-300 hover:scale-[1.02]">
                  Request Quote
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleResetColors}
                    className="py-3 border border-white/20 text-white/80 font-medium rounded-xl hover:bg-white/5 transition-all duration-300"
                  >
                    Reset
                  </button>
                  <button className="py-3 border border-[var(--accent)]/40 text-[var(--accent)] font-medium rounded-xl hover:bg-[var(--accent)]/10 transition-all duration-300">
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--accent)]/10 to-[var(--violet)]/10 border border-[var(--accent)]/20">
              <p className="text-sm text-[#e2fbff]">
                <span className="font-semibold">💡 Tip:</span> Click directly
                on car parts in the 3D view to select them for customization!
              </p>
            </div>
          </div>
        </div>

        {/* Mobile + Tablet panel — outside the desktop grid, hidden on lg */}
        <div
          ref={mobilePanelRef}
          className="relative z-[2] grid grid-cols-1 bg-[#0a0a12] pb-20 opacity-0 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-white/[0.06] sm:pb-0 lg:hidden"
        >
          {/* Pinch-to-zoom hint — mobile only */}
          <div className="border-b border-white/[0.04] py-2 text-center text-[10px] uppercase tracking-[0.22em] text-white/25 sm:hidden sm:col-span-2">
            Drag to rotate · Pinch to zoom
          </div>

          {/* Parts section */}
          <section className="border-b border-white/[0.06] px-4 py-4 sm:border-b-0 sm:px-5 sm:py-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-monument text-[9px] uppercase tracking-[0.22em] text-white/85 sm:text-[11px]">
                Select Part
              </h3>
              <span className="text-[8px] uppercase tracking-[0.2em] text-white/35 sm:text-[10px]">
                {partConfigs.length} options
              </span>
            </div>
            <div
              className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0"
              style={{ touchAction: "pan-x" }}
            >
              {partConfigs.map((part) => {
                const active = selectedPart === part.id;
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => handlePartSelect(part.id)}
                    aria-pressed={active}
                    className={`relative flex min-h-[64px] w-[76px] shrink-0 snap-start flex-col items-center justify-center rounded-xl border px-2 py-2 transition-colors duration-200 sm:min-h-0 sm:w-auto sm:shrink sm:p-3 ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)]/15"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                    style={{ touchAction: "manipulation" }}
                  >
                    <span
                      aria-hidden
                      className="text-[14px] leading-none sm:text-base"
                    >
                      {part.icon}
                    </span>
                    <span className="mt-1 text-[10px] font-medium leading-none text-white sm:text-xs">
                      {part.name}
                    </span>
                    <span
                      aria-hidden
                      className="mt-1 block h-3 w-3 rounded-full border border-white/20 sm:h-4 sm:w-4"
                      style={{ backgroundColor: partColors[part.id] }}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Colors section */}
          <section className="px-4 py-4 sm:px-5 sm:py-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-monument text-[9px] uppercase tracking-[0.22em] text-white/85 sm:text-[11px]">
                {currentPartConfig?.name || "Part"} Color
              </h3>
              <span className="hidden text-[10px] uppercase tracking-[0.2em] text-white/35 sm:inline">
                {colorOptions.length} swatches
              </span>
            </div>

            {selectedPart ? (
              <>
                <div className="color-grid grid grid-cols-6 gap-2 sm:grid-cols-6 sm:gap-2.5">
                  {colorOptions.map((color) => {
                    const isOn = partColors[selectedPart] === color.value;
                    return (
                      <div
                        key={color.id}
                        className="-m-1 p-1"
                        style={{ touchAction: "manipulation" }}
                      >
                        <button
                          type="button"
                          onClick={() => handleColorChange(color.value)}
                          aria-pressed={isOn}
                          aria-label={`Select ${color.name}`}
                          title={color.name}
                          className="relative aspect-square w-full rounded-full transition-transform duration-100 ease-out active:scale-[1.3]"
                          style={{
                            backgroundColor: color.value,
                            touchAction: "manipulation",
                            boxShadow: isOn
                              ? "0 0 0 1.5px rgba(110,240,200,0.95), 0 0 0 4px rgba(110,240,200,0.18), inset 0 0 0 1px rgba(255,255,255,0.08)"
                              : "0 0 0 1px rgba(255,255,255,0.10), inset 0 0 0 1px rgba(255,255,255,0.06)",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-[11px] text-white/55 sm:hidden">
                  Selected:{" "}
                  <span className="font-medium text-white">
                    {colorOptions.find(
                      (c) => c.value === partColors[selectedPart],
                    )?.name || "Custom"}
                  </span>
                </p>
                <div className="mt-3 hidden text-xs sm:flex sm:items-center sm:justify-between">
                  <span className="uppercase tracking-[0.18em] text-white/40">
                    Selected
                  </span>
                  <span className="text-white/85">
                    {colorOptions.find(
                      (c) => c.value === partColors[selectedPart],
                    )?.name || "Custom"}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-white/40">
                Select a part above to change its color
              </p>
            )}
          </section>

          {/* Footer / CTA — sticky on mobile, inline + spans both columns on tablet */}
          <div className="sticky bottom-0 z-10 border-t border-white/[0.08] bg-[#0a0a12] px-4 py-3 sm:static sm:col-span-2 sm:border-t sm:border-white/[0.05] sm:px-5 sm:py-4">
            {/* Mobile compact build dots */}
            <div className="mb-2.5 flex items-center gap-1.5 sm:hidden">
              {partConfigs.map((part) => (
                <span
                  key={part.id}
                  className="block h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: partColors[part.id],
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.15)",
                  }}
                />
              ))}
              <span className="ml-auto text-[9px] uppercase tracking-[0.2em] text-white/35">
                Build
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              {/* Tablet build dots + label */}
              <div className="hidden sm:flex sm:items-center sm:gap-2">
                <div className="flex items-center gap-1">
                  {partConfigs.map((part) => (
                    <span
                      key={part.id}
                      className="block h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: partColors[part.id],
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.15)",
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Current build
                </span>
              </div>

              <div className="flex items-stretch gap-2 sm:items-center sm:gap-2">
                <button
                  type="button"
                  onClick={handleResetColors}
                  className="flex-1 rounded-xl border border-white/15 px-3 py-2.5 text-[12px] font-medium text-white/80 transition-colors hover:bg-white/5 sm:flex-none sm:px-5 sm:py-2 sm:text-sm"
                  style={{ touchAction: "manipulation" }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-[var(--accent)]/40 px-3 py-2.5 text-[12px] font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10 sm:flex-none sm:px-5 sm:py-2 sm:text-sm"
                  style={{ touchAction: "manipulation" }}
                >
                  Save Build
                </button>
                <button
                  type="button"
                  className="flex-[1.5] rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--violet)] px-3 py-2.5 text-[12px] font-semibold text-[var(--bg)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--accent)]/25 sm:flex-none sm:px-5 sm:py-2 sm:text-sm"
                  style={{ touchAction: "manipulation" }}
                >
                  Request Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl bg-[var(--surface)]/90 border border-white/10 overflow-hidden backdrop-blur-sm">
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
