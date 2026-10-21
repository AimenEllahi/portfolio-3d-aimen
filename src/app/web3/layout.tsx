import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web3 & Blockchain — Aimen Qaiser",
  description: "Aimen Qaiser's Web3 development capabilities and Solidity work.",
};

export default function Web3Layout({ children }: { children: React.ReactNode }) {
  return children;
}
