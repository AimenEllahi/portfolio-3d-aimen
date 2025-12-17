"use client";

import { usePathname } from "next/navigation";
import BackgroundSwitcher from "./BackgroundSwitcher";
import ParticleBackground from "./ParticleBackground";

export default function ConditionalBackground() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (isHomePage) {
    return <BackgroundSwitcher />;
  }

  return <ParticleBackground />;
}
