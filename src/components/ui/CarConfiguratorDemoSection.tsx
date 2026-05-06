"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { gsap } from "gsap";

import CarConfiguratorScene from "@/components/CarConfiguratorScene";
import type { CarPart } from "@/components/CarModel";
import {
  ConfigurablePart,
  useConfiguratorStore,
} from "@/store/configuratorStore";

interface ColorOption {
  id: string;
  name: string;
  value: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { id: "carbon-black", name: "Carbon Black", value: "#18181b" },
  { id: "midnight-navy", name: "Midnight Navy", value: "#1e3a5f" },
  { id: "british-green", name: "British Racing Green", value: "#004225" },
  { id: "racing-red", name: "Racing Red", value: "#dc2626" },
  { id: "papaya", name: "Papaya Orange", value: "#FF5F1F" },
  { id: "sunset-orange", name: "Sunset Orange", value: "#ea580c" },
  { id: "gold", name: "Champagne Gold", value: "#d4af37" },
  { id: "pearl-white", name: "Pearl White", value: "#f8fafc" },
  { id: "silver", name: "Silver Metallic", value: "#C0C0C0" },
  { id: "ocean-blue", name: "Ocean Blue", value: "#2563eb" },
  { id: "royal-purple", name: "Royal Purple", value: "#7c3aed" },
  { id: "emerald", name: "Emerald", value: "#059669" },
];

interface PartConfigItem {
  id: ConfigurablePart;
  name: string;
  description: string;
}

const PART_CONFIGS: PartConfigItem[] = [
  { id: "body", name: "Body", description: "Main panels & exterior" },
  { id: "accents", name: "Accents", description: "Stripes & accent lines" },
  { id: "wheels", name: "Wheels", description: "Rims & wheel components" },
  { id: "interior", name: "Interior", description: "Seats & trim" },
  { id: "windows", name: "Windows", description: "Window tint" },
  { id: "chrome", name: "Chrome", description: "Metallic accents" },
];

const CONFIGURABLE_PART_SET = new Set<ConfigurablePart>(
  PART_CONFIGS.map((p) => p.id),
);

function indexLabel(i: number): string {
  return String(i + 1).padStart(2, "0");
}

export default function CarConfiguratorDemoSection() {
  const {
    partColors,
    selectedPart,
    hoveredPart,
    setPartColor,
    setSelectedPart,
    setHoveredPart,
    resetColors,
  } = useConfiguratorStore();

  const [isLoading, setIsLoading] = useState(true);
  const viewerPulseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setIsLoading(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  const currentPartConfig = useMemo(
    () => PART_CONFIGS.find((p) => p.id === selectedPart) || null,
    [selectedPart],
  );

  const handlePartSelect = (part: ConfigurablePart) => {
    setSelectedPart(part);
  };

  const handleColorChange = (color: string) => {
    if (!selectedPart) return;
    setPartColor(selectedPart, color);

    if (!viewerPulseRef.current) return;
    gsap.fromTo(
      viewerPulseRef.current,
      { boxShadow: "0 0 0 0 rgba(110, 240, 200, 0)" },
      {
        boxShadow: "0 0 26px 6px rgba(110, 240, 200, 0.18)",
        duration: 0.22,
        yoyo: true,
        repeat: 1,
      },
    );
  };

  const handlePartClick = (part: CarPart) => {
    if (CONFIGURABLE_PART_SET.has(part as ConfigurablePart)) {
      setSelectedPart(part as ConfigurablePart);
    }
  };

  const handlePartHover = (part: CarPart | null) => {
    setHoveredPart(part);
  };

  const hoveredConfigName = useMemo(() => {
    if (!hoveredPart) return null;
    const match = PART_CONFIGS.find(
      (p) => p.id === (hoveredPart as unknown as ConfigurablePart),
    );
    return match?.name ?? String(hoveredPart);
  }, [hoveredPart]);

  const activeColorName = useMemo(() => {
    if (!selectedPart) return null;
    const v = partColors[selectedPart];
    return COLOR_OPTIONS.find((c) => c.value === v)?.name || "Custom";
  }, [partColors, selectedPart]);

  return (
    <section
      id="configurator-demo"
      className="relative z-10 border-t border-[var(--border)] bg-[var(--bg)]/90 px-4 py-20 backdrop-blur-[2px] sm:px-6 sm:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <motion.header
          className="mb-8 max-w-2xl sm:mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
            03 / Demo
          </p>
          <h2 className="font-monument text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl lg:text-[2.5rem]">
            Configure your drive
          </h2>
          <p className="font-neue mt-3 text-[0.9rem] leading-relaxed text-gray-400">
            A real-time, in-browser configurator. Pick a part, swap a finish — see it instantly.
          </p>
          <div className="mt-4 h-px w-20 bg-[var(--accent)]" />
        </motion.header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--surface)]/90 to-[var(--bg)]/95">
            <div ref={viewerPulseRef} className="relative">
              <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[560px]">
                <CarConfiguratorScene
                  colors={partColors}
                  selectedPart={selectedPart ? (selectedPart as CarPart) : null}
                  onPartClick={handlePartClick}
                  onPartHover={handlePartHover}
                />
              </div>

              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

              <div className="pointer-events-none absolute left-4 top-4 z-[2] flex flex-col gap-2 sm:left-5 sm:top-5">
                <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-white/60 backdrop-blur-md">
                  Live Preview
                </span>
                {hoveredConfigName ? (
                  <span className="rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[0.7rem] text-white/85 backdrop-blur-md">
                    Hover · {hoveredConfigName}
                  </span>
                ) : null}
              </div>

              {selectedPart ? (
                <div className="pointer-events-none absolute bottom-4 left-4 z-[2] sm:bottom-5 sm:left-5">
                  <div className="flex items-center gap-2 rounded-full border border-[var(--accent)]/35 bg-black/45 px-3 py-1.5 backdrop-blur-md">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 rounded-full ring-1 ring-white/30"
                      style={{ backgroundColor: partColors[selectedPart] }}
                    />
                    <span className="text-[0.7rem] uppercase tracking-[0.18em] text-white/55">
                      Editing
                    </span>
                    <span className="text-[0.78rem] font-medium text-white">
                      {currentPartConfig?.name}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="pointer-events-none absolute bottom-4 right-4 z-[2] hidden text-[0.65rem] uppercase tracking-[0.22em] text-white/35 sm:block">
                Drag to rotate · Scroll to zoom
              </div>

              {isLoading ? (
                <div className="absolute inset-0 z-[3] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[0.72rem] uppercase tracking-[0.22em] text-white/75">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
                    Loading model
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="flex flex-col gap-5">
            <div className="rounded-2xl border border-white/10 bg-[var(--surface)]/85 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="font-monument text-sm uppercase tracking-[0.22em] text-white/85">
                  Parts
                </h3>
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/35">
                  {PART_CONFIGS.length} options
                </span>
              </div>

              <ul className="flex flex-col divide-y divide-white/5">
                {PART_CONFIGS.map((part, i) => {
                  const active = selectedPart === part.id;
                  return (
                    <li key={part.id}>
                      <button
                        type="button"
                        onClick={() => handlePartSelect(part.id)}
                        aria-pressed={active}
                        className={`group relative flex w-full items-center gap-4 py-3 text-left transition-colors ${
                          active
                            ? "text-white"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        <span
                          className={`absolute left-0 top-1/2 h-6 w-px -translate-y-1/2 transition-colors ${
                            active
                              ? "bg-[var(--accent)]"
                              : "bg-transparent group-hover:bg-white/20"
                          }`}
                          aria-hidden
                        />
                        <span
                          className={`pl-3 font-mono text-[0.7rem] tracking-[0.14em] transition-colors ${
                            active
                              ? "text-[var(--accent)]"
                              : "text-white/35 group-hover:text-white/55"
                          }`}
                        >
                          {indexLabel(i)}
                        </span>

                        <div className="flex flex-1 flex-col">
                          <span className="font-monument text-sm">
                            {part.name}
                          </span>
                          <span className="text-[0.7rem] text-white/40">
                            {part.description}
                          </span>
                        </div>

                        <span
                          aria-hidden
                          className={`h-3 w-3 rounded-full ring-1 transition-shadow ${
                            active
                              ? "ring-[var(--accent)] shadow-[0_0_0_3px_rgba(110,240,200,0.18)]"
                              : "ring-white/15"
                          }`}
                          style={{ backgroundColor: partColors[part.id] }}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[var(--surface)]/85 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="font-monument text-sm uppercase tracking-[0.22em] text-white/85">
                  Finish
                </h3>
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/35">
                  {currentPartConfig?.name || "—"}
                </span>
              </div>

              {selectedPart ? (
                <>
                  <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                    {COLOR_OPTIONS.map((color) => {
                      const isOn = partColors[selectedPart] === color.value;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => handleColorChange(color.value)}
                          aria-pressed={isOn}
                          aria-label={`Choose ${color.name}`}
                          title={color.name}
                          className={`relative aspect-square rounded-full transition-transform duration-200 ease-out hover:scale-[1.08] ${
                            isOn ? "scale-[1.06]" : ""
                          }`}
                          style={{
                            backgroundColor: color.value,
                            boxShadow: isOn
                              ? "0 0 0 1.5px rgba(110,240,200,0.95), 0 0 0 4px rgba(110,240,200,0.18), inset 0 0 0 1px rgba(255,255,255,0.08)"
                              : "0 0 0 1px rgba(255,255,255,0.10), inset 0 0 0 1px rgba(255,255,255,0.06)",
                          }}
                        />
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[0.72rem] text-white/55">
                    <span className="uppercase tracking-[0.2em] text-white/35">
                      Selected
                    </span>
                    <span className="text-white/85">{activeColorName}</span>
                  </div>
                </>
              ) : (
                <p className="text-[0.78rem] text-white/45">
                  Select a part to change its finish.
                </p>
              )}

              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => resetColors()}
                  className="rounded-full border border-white/12 px-3.5 py-1.5 text-[0.72rem] uppercase tracking-[0.18em] text-white/70 transition-colors hover:border-white/25 hover:text-white"
                >
                  Reset
                </button>
                <Link
                  href="/configurator"
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3.5 py-1.5 text-[0.72rem] uppercase tracking-[0.18em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/18"
                >
                  Full view
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
