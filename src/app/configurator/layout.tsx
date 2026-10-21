import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Car Configurator — Aimen Qaiser",
  description: "Explore an interactive 3D car configurator and customize each part's finish.",
};

export default function ConfiguratorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
