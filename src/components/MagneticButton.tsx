"use client";

import { useRef, type ReactNode } from "react";
import { useCursor } from "@/components/CustomCursor";
import { useMagnetic } from "@/hooks/useMagnetic";

type MagneticButtonProps = {
  children: ReactNode;
  strength?: number;
};

export default function MagneticButton({
  children,
  strength = 0.4,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  useMagnetic(ref, { strength });
  const { setHovering } = useCursor();

  return (
    <div
      ref={ref}
      style={{ display: "inline-block" }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {children}
    </div>
  );
}
