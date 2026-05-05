import * as THREE from "three";

export const HERO_SHADER_UNIFORMS = {
  /** Deep teal-ink — void (no purple bias) */
  uColor1: "#021918",
  uColor2: "#001e2e",
  uColor3: "#042a22",
  uColor4: "#002119",
  /** Bright teal pulse — aligns with `--accent` */
  uHighlight1: "#3dd9b8",
  /** Core accent teal #6ef0c8 cluster */
  uHighlight2: "#6ef0c8",
} as const;

/** Same base colours for any non-shader dome / tooling that needs stops. */
export function heroGradientStopsHex(): readonly string[] {
  return [
    HERO_SHADER_UNIFORMS.uColor1,
    HERO_SHADER_UNIFORMS.uColor2,
    HERO_SHADER_UNIFORMS.uColor3,
    HERO_SHADER_UNIFORMS.uColor4,
  ];
}

/** Vertex shader for the hero environment dome (sphere UVs → fragment). */
export const HERO_ENV_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const HERO_ENV_FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uScrollY;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uHighlight1;
uniform vec3 uHighlight2;

vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}

float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,
                    -.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz;
  x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m;m=m*m;
  vec3 x=2.*fract(p*C.www)-1.;
  vec3 h=abs(x)-.5;
  vec3 ox=floor(x+.5);
  vec3 a0=x-ox;
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}

float fbm(vec2 p, int octaves) {
  float val   = 0.0;
  float amp   = 0.5;
  float freq  = 1.0;
  float total = 0.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    val   += snoise(p * freq) * amp;
    total += amp;
    amp   *= 0.48;
    freq  *= 2.1;
    p     += vec2(0.3, 0.7);
  }
  return val / total;
}

vec3 palette(float t, vec3 c1, vec3 c2, vec3 c3, vec3 c4) {
  t = clamp(t, 0.0, 1.0);
  if (t < 0.33) return mix(c1, c2, t / 0.33);
  if (t < 0.66) return mix(c2, c3, (t - 0.33) / 0.33);
  return mix(c3, c4, (t - 0.66) / 0.34);
}

void main() {
  vec2 uv = vUv;
  float t  = uTime * 0.08;

  vec2 mouse  = uMouse - 0.5;
  vec2 toMouse = uv - (uMouse);
  float mDist = length(toMouse);
  vec2 mWarp  = normalize(toMouse + 0.001) * (1.0 / (mDist * 8.0 + 1.0)) * 0.04;

  vec2 p1  = uv * 1.6 + vec2(t * 0.3, t * 0.15) + mWarp;
  float n1 = fbm(p1, 5);

  vec2 p2  = uv * 3.2 + vec2(-t * 0.5, t * 0.4) - mWarp * 0.5;
  float n2 = fbm(p2, 4);

  vec2 p3  = uv * 7.0 + vec2(t * 0.8, -t * 0.6);
  float n3 = snoise(p3) * 0.5 + 0.5;

  float combined = n1 * 0.55 + n2 * 0.30 + n3 * 0.15;
  combined = combined * 0.5 + 0.5;

  vec3 color = palette(combined, uColor1, uColor2, uColor3, uColor4);

  float vein1 = pow(max(0.0, n1 * 0.5 + 0.5 - 0.55), 2.5) * 2.2;
  float vein2 = pow(max(0.0, n2 * 0.5 + 0.5 - 0.60), 2.0) * 1.8;

  float pulse = sin(uTime * 0.4 + combined * 6.28) * 0.5 + 0.5;
  pulse = pow(pulse, 3.0);

  color += uHighlight1 * vein1 * (0.6 + pulse * 0.4);
  color += uHighlight2 * vein2 * 0.5;

  vec2 centeredUv = uv - 0.5;
  float radial = 1.0 - length(centeredUv) * 1.4;
  radial = pow(max(radial, 0.0), 1.8);
  color += mix(uColor1, uHighlight1, 0.3) * radial * 0.25;

  float mouseGlow = 1.0 / (mDist * 6.0 + 1.0);
  mouseGlow = pow(mouseGlow, 2.0) * 0.3;
  color += uHighlight2 * mouseGlow;

  float scrollBoost = uScrollY * 0.15;
  color += color * scrollBoost;

  float vig = 1.0 - dot(centeredUv * 1.6, centeredUv * 1.6);
  vig = pow(max(vig, 0.0), 0.7);
  color *= vig;

  float grain = fract(sin(dot(uv * 1000.0 + uTime, vec2(127.1, 311.7))) * 43758.5);
  color += (grain - 0.5) * 0.022;

  float minBright = 0.04;
  color = max(color, vec3(minBright));
  color = clamp(color, 0.0, 0.92);

  gl_FragColor = vec4(color, 1.0);
}
`;

/** Initial uniform values for the hero dome `ShaderMaterial` (mutate refs in useFrame). */
export function createHeroEnvUniforms() {
  return {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uScrollY: { value: 0 },
    uColor1: { value: new THREE.Color(HERO_SHADER_UNIFORMS.uColor1) },
    uColor2: { value: new THREE.Color(HERO_SHADER_UNIFORMS.uColor2) },
    uColor3: { value: new THREE.Color(HERO_SHADER_UNIFORMS.uColor3) },
    uColor4: { value: new THREE.Color(HERO_SHADER_UNIFORMS.uColor4) },
    uHighlight1: { value: new THREE.Color(HERO_SHADER_UNIFORMS.uHighlight1) },
    uHighlight2: { value: new THREE.Color(HERO_SHADER_UNIFORMS.uHighlight2) },
  };
}
