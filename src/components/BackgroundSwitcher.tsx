"use client";

import { useBackgroundStore } from "@/store/backgroundStore";
import ParticleBackground from "./ParticleBackground";
import InteractiveWaveBackground from "./InteractiveWaveBackground";

export default function BackgroundSwitcher() {
  const { backgroundType } = useBackgroundStore();

  switch (backgroundType) {
    case "waves":
      return <InteractiveWaveBackground />;
    case "particles":
    default:
      return <ParticleBackground />;
  }
}
