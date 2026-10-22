"use client";

export default function Loader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#050508]/90"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          aria-hidden="true"
          className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)]"
        />
        <div>
          <p className="font-medium text-white">Loading 3D model</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Preparing your preview</p>
        </div>
      </div>
    </div>
  );
}
