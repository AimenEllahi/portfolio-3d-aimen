"use client";

import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import { motion } from "framer-motion";

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uMouse;
uniform float uHover;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)),
           dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

vec3 voronoi(vec2 uv, float t, vec2 mousePush) {
  vec2 id  = floor(uv);
  vec2 gv  = fract(uv) - 0.5;

  float minDist  = 10.0;
  float minDist2 = 10.0;
  vec2  minCell  = vec2(0.0);

  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 cell   = id + offset;
      vec2 h      = hash2(cell);

      vec2 centre = offset + h * 0.7 - 0.35
        + 0.18 * vec2(
            sin(t * 0.55 + h.x * 6.28),
            cos(t * 0.42 + h.y * 6.28)
          );

      vec2 worldCell = (cell + centre + gv) / 10.0;
      float md = length(worldCell - mousePush);
      float repel = smoothstep(0.18, 0.0, md) * 0.25 * uHover;
      centre += normalize(worldCell - mousePush + 0.001) * repel;

      vec2  delta = gv - centre;
      float d     = length(delta);

      if (d < minDist) {
        minDist2 = minDist;
        minDist  = d;
        minCell  = cell;
      } else if (d < minDist2) {
        minDist2 = d;
      }
    }
  }

  float edge = minDist2 - minDist;
  float cellId = fract(sin(dot(minCell, vec2(7.3, 157.9))) * 43758.5);

  return vec3(edge, minDist, cellId);
}

vec3 cellColour(float id, float dist) {
  vec3 c1 = vec3(0.008, 0.098, 0.094);
  vec3 c2 = vec3(0.004, 0.055, 0.110);
  vec3 c3 = vec3(0.020, 0.010, 0.065);

  vec3 base = id < 0.33 ? c1 : id < 0.66 ? c2 : c3;

  float glow = 1.0 - smoothstep(0.0, 0.35, dist);
  base += glow * vec3(0.03, 0.12, 0.10);

  return base;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 asp = uv;
  asp.x *= uResolution.x / uResolution.y;

  float t = uTime;
  float scale = 6.5 + sin(t * 0.07) * 0.5;
  vec2 scaledUv = asp * scale;

  vec2 mouse = vec2(uMouse.x * uResolution.x / uResolution.y,
                    (1.0 - uMouse.y)) * scale;

  vec3 v   = voronoi(scaledUv, t, mouse / scale);
  float edge    = v.x;
  float centre  = v.y;
  float cellId  = v.z;

  vec3 col = cellColour(cellId, centre);

  float edgeLine = 1.0 - smoothstep(0.0, 0.032, edge);
  vec3 crackCol = vec3(0.431, 0.941, 0.784);
  col = mix(col, crackCol * 0.75, edgeLine * 0.9);

  vec2 toMouse = scaledUv - mouse;
  float mDist = length(toMouse);
  float mGlow = (1.0 / (mDist * 4.0 + 1.0)) * uHover;
  mGlow = pow(mGlow, 1.8) * 0.5;
  col += crackCol * mGlow * 0.4;

  float pulse = sin(t * 1.1 + cellId * 12.56) * 0.5 + 0.5;
  pulse = pow(pulse, 4.0) * 0.18;
  col += crackCol * edgeLine * pulse;

  vec2 vig = uv * 2.0 - 1.0;
  float v2 = pow(max(0.0, 1.0 - dot(vig * 1.4, vig * 1.4)), 0.6);
  col *= v2;

  float grain = fract(sin(dot(uv * 800.0 + t, vec2(127.1, 311.7))) * 43758.5);
  col += (grain - 0.5) * 0.018;

  col = max(col, vec3(0.012));
  col = clamp(col, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) ?? "shader error");
  }
  return sh;
}

function createProgram(
  gl: WebGLRenderingContext,
  vert: string,
  frag: string,
): WebGLProgram {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) ?? "program error");
  }
  return prog;
}

export default function VoronoiShaderSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseLerpRef = useRef({ x: 0.5, y: 0.5 });
  const hoverRef = useRef(0);
  const hoverLerpRef = useRef(0);
  const rafRef = useRef<number>(0);
  const glRef = useRef<{
    gl: WebGLRenderingContext;
    prog: WebGLProgram;
    uTime: WebGLUniformLocation;
    uResolution: WebGLUniformLocation;
    uMouse: WebGLUniformLocation;
    uHover: WebGLUniformLocation;
  } | null>(null);
  const startRef = useRef(performance.now());
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: false,
    }) as WebGLRenderingContext | null;

    if (!gl) {
      setWebglOk(false);
      return;
    }

    let prog: WebGLProgram;
    try {
      prog = createProgram(gl, VERT, FRAG);
    } catch (e) {
      console.error("Shader compile error:", e);
      setWebglOk(false);
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "uTime")!;
    const uResolution = gl.getUniformLocation(prog, "uResolution")!;
    const uMouse = gl.getUniformLocation(prog, "uMouse")!;
    const uHover = gl.getUniformLocation(prog, "uHover")!;

    glRef.current = { gl, prog, uTime, uResolution, uMouse, uHover };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = true;
    const onVisChange = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisChange);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      if (!visible || !glRef.current) return;

      const { gl, uTime, uResolution, uMouse, uHover } = glRef.current;
      const t = (performance.now() - startRef.current) / 1000;

      const lx = mouseLerpRef.current.x;
      const ly = mouseLerpRef.current.y;
      const tx = mouseRef.current.x;
      const ty = mouseRef.current.y;
      mouseLerpRef.current.x = lx + (tx - lx) * 0.06;
      mouseLerpRef.current.y = ly + (ty - ly) * 0.06;

      const hTarget = hoverRef.current;
      hoverLerpRef.current += (hTarget - hoverLerpRef.current) * 0.05;

      gl.uniform1f(uTime, t);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseLerpRef.current.x, mouseLerpRef.current.y);
      gl.uniform1f(uHover, hoverLerpRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisChange);
      gl.deleteProgram(prog);
      if (buf) gl.deleteBuffer(buf);
      glRef.current = null;
    };
  }, []);

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };
  const onMouseEnter = () => {
    hoverRef.current = 1;
  };
  const onMouseLeave = () => {
    hoverRef.current = 0;
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = e.touches[0];
    mouseRef.current = {
      x: (t.clientX - rect.left) / rect.width,
      y: (t.clientY - rect.top) / rect.height,
    };
    hoverRef.current = 1;
  };
  const onTouchEnd = () => {
    hoverRef.current = 0;
  };

  return (
    <section
      id="shader-lab"
      className="relative z-10 border-t border-[var(--border)] bg-[var(--bg)]"
    >
      <div className="mx-auto w-full max-w-[1104px] px-4 sm:px-6">
        <motion.div
          className="flex flex-col gap-3 py-12 sm:py-16 lg:py-20"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-[var(--accent)] sm:text-xs">
            04 / Lab
          </p>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-monument text-2xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl lg:text-[2.5rem]">
              Shader Lab
            </h2>
            <p className="font-neue text-[0.82rem] text-white/35 sm:text-[0.88rem]">
              Move your mouse across the surface
            </p>
          </div>
          <div className="h-px w-16 bg-[var(--accent)] sm:w-20" />
        </motion.div>
      </div>

      <motion.div
        className="relative mx-auto w-full max-w-[1104px] px-4 pb-12 sm:px-6 sm:pb-16 lg:pb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-5% 0px" }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="relative cursor-crosshair overflow-hidden rounded-2xl border border-white/[0.08]"
          style={{ aspectRatio: "16/7" }}
          onMouseMove={onMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {webglOk ? (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full"
              style={{ display: "block" }}
              aria-label="Interactive Voronoi crystal shader — move mouse to interact"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 40% 50%, #0d0030 0%, #001a40 40%, #050508 100%)",
              }}
            />
          )}

          <div className="pointer-events-none absolute left-4 top-4 z-[2] sm:left-5 sm:top-5">
            <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-white/50 backdrop-blur-md">
              Voronoi Crystal Field
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-4 right-4 z-[2] hidden flex-col items-end gap-1 sm:right-5 sm:bottom-5 sm:flex">
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/25">
              GLSL · WebGL
            </span>
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/20">
              Interactive
            </span>
          </div>

          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(110,240,200,0.06)",
            }}
          />
        </div>

        <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-neue max-w-lg text-[0.78rem] leading-relaxed text-white/30">
            A real-time Voronoi crystal field written in GLSL. Mouse proximity
            pushes cell centres, cracking and reforming the surface.
          </p>
          <div className="flex shrink-0 items-center gap-3">
            {["GLSL", "Simplex Noise", "Worley F2-F1"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[0.65rem] tracking-[0.08em] text-white/35"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
