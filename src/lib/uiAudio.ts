/**
 * Lightweight UI feedback — Web Audio oscillators (no external files).
 *
 * The `AudioContext` is allocated only inside `unlockUiAudio()` — during a transient user gesture
 * (tap, wheel, scroll, keyboard, mouse move). Sounds requested before unlock queue and play once
 * the graph is running.
 */

let sharedCtx: AudioContext | null = null;

const pendingInteractive: UiSoundId[] = [];

function ensureCtxCreated(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (sharedCtx) return sharedCtx;

  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;

  sharedCtx = new AC();
  sharedCtx.addEventListener("statechange", () => {
    if (sharedCtx?.state === "running") {
      flushInteractiveQueue();
    }
  });
  return sharedCtx;
}

function getExistingCtx(): AudioContext | null {
  return typeof window === "undefined" ? null : sharedCtx;
}

function flushInteractiveQueue(): void {
  const ctx = getExistingCtx();
  if (!ctx || ctx.state !== "running") return;
  const batch = pendingInteractive.splice(0, pendingInteractive.length);
  for (const id of batch) {
    playUiSoundEngine(ctx, id);
  }
}

export function unlockUiAudio(): void {
  if (typeof window === "undefined") return;
  const c = ensureCtxCreated();
  if (!c) return;
  void c.resume().then(() => {
    flushInteractiveQueue();
  });
}

function gestureUnlock(): void {
  if (getExistingCtx()?.state === "running") return;
  unlockUiAudio();
}

let globalUnlockInstalled = false;

function installGlobalGestureUnlock(): void {
  if (typeof window === "undefined" || globalUnlockInstalled) return;
  globalUnlockInstalled = true;

  const passive: AddEventListenerOptions = {
    passive: true,
    capture: true,
  };

  for (const type of [
    "pointerdown",
    "touchstart",
    "touchend",
    "wheel",
    "keydown",
    "scroll",
  ]) {
    window.addEventListener(type, gestureUnlock, passive);
  }

  document.addEventListener("mousemove", gestureUnlock, {
    passive: true,
    capture: true,
    once: true,
  });
}

if (typeof window !== "undefined") {
  queueMicrotask(() => installGlobalGestureUnlock());
}

function scheduleBeep(
  ctx: AudioContext,
  when: number,
  freq: number,
  duration: number,
  type: OscillatorType,
  peakGain: number,
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(peakGain, when + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + duration + 0.02);
}

export type UiSoundId =
  | "click"
  | "hover"
  | "tick"
  | "deal"
  | "progressPulse";

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function playUiSoundEngine(ctx: AudioContext, id: UiSoundId): void {
  const t = ctx.currentTime;

  switch (id) {
    case "click":
      scheduleBeep(ctx, t, 920, 0.055, "sine", 0.08);
      scheduleBeep(ctx, t + 0.022, 520, 0.04, "sine", 0.042);
      break;
    case "hover":
      scheduleBeep(ctx, t, 620, 0.032, "triangle", 0.055);
      break;
    case "tick":
      scheduleBeep(ctx, t, 720, 0.035, "sine", 0.055);
      break;
    case "deal":
      scheduleBeep(ctx, t, 392, 0.07, "sine", 0.08);
      scheduleBeep(ctx, t + 0.055, 523, 0.08, "sine", 0.06);
      scheduleBeep(ctx, t + 0.11, 659, 0.1, "sine", 0.045);
      break;
    case "progressPulse":
      scheduleBeep(ctx, t, 1320, 0.024, "sine", 0.028);
      break;
    default:
      break;
  }
}

export function playUiSound(id: UiSoundId): void {
  if (typeof window === "undefined") return;
  if (reducedMotion()) {
    if (id === "progressPulse") {
      return;
    }
  }

  const ctx = getExistingCtx();

  if (!ctx) {
    pendingInteractive.push(id);
    return;
  }

  if (ctx.state !== "running") {
    pendingInteractive.push(id);
    void ctx.resume().then(() => flushInteractiveQueue());
    return;
  }

  playUiSoundEngine(ctx, id);
}
