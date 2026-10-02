import { AMPLITUDE, HALF_LENGTH } from './heroCurve';

// A single triangle larger than the screen, so there is no seam to rasterize.
export const VERTEX = `#version 300 es
in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// The #version line has to be the first byte, so the template starts flush against the backtick.
export const FRAGMENT = `#version 300 es
precision highp float;

uniform vec2 uResolution;   // drawing buffer, px
uniform float uTime;        // seconds of active time
uniform float uNode;        // 0..1, where the bright node sits along the curve
uniform float uDrift;       // 0..1, eases the sway in so the canvas starts exactly where the poster is
uniform vec2 uCenter;       // stage center, px, y up
uniform float uUnit;        // px per world unit
uniform vec2 uRampFrom;     // glow floor starts here, px
uniform vec2 uRampVec;      // (to - from) / |to - from|^2, so dot() gives 0..1
uniform float uMinGlow;
uniform float uChroma;      // channel offset in px; 0 turns it off
uniform float uGrain;
uniform vec3 uInk;
uniform vec3 uCore;
uniform vec3 uInner;
uniform vec3 uHalo;

out vec4 fragColor;

const float PI = 3.14159265;
const float HALF_LENGTH = ${HALF_LENGTH.toFixed(3)};
const float AMPLITUDE = ${AMPLITUDE.toFixed(3)};
const float FREQUENCY = PI / HALF_LENGTH;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Emissive light at one pixel: core, inner glow and two halo layers stand in for a bloom pass.
vec3 filament(vec2 frag) {
  vec2 p = (frag - uCenter) / uUnit;

  // Two unrelated periods (11 s and 15 s) so the sway never reads as a loop; wide enough to see within a few seconds.
  p -= uDrift * vec2(0.11 * sin(uTime * 0.55), 0.15 * sin(uTime * 0.42));

  // Simulated yaw (29 s period): squeeze x and shrink the far end instead of rotating a tube.
  float yaw = uDrift * 0.6 * sin(uTime * 0.22);
  float c = cos(yaw);
  float x = p.x / c;
  float depth = 1.0 / (1.0 + 0.18 * x * sin(yaw));

  float phase = x * FREQUENCY;
  float slope = AMPLITUDE * FREQUENCY * cos(phase) * depth / c;
  float across = abs(p.y - AMPLITUDE * sin(phase) * depth) / sqrt(1.0 + slope * slope);
  float along = max(abs(x) - HALF_LENGTH, 0.0) * c * depth;
  float d = length(vec2(across, along));

  float u = clamp(x / (2.0 * HALF_LENGTH) + 0.5, 0.0, 1.0);
  float q = (u - uNode) / 0.1;
  float node = exp(-q * q);
  float pulse = 1.0 + 0.4 * sin(uTime * 1.5707963);
  float ends = 1.0 - 0.65 * smoothstep(0.7, 1.0, abs(x) / HALF_LENGTH);

  float core = exp(-d * d / (2.0 * 0.011 * 0.011));
  float inner = exp(-d / 0.05);
  float halo = exp(-d * d / (2.0 * 0.2 * 0.2));
  float haze = 1.0 / (1.0 + d * d / 0.3025);

  vec3 glow = uCore * core * 1.2 * (1.0 + 2.6 * node)
    + uInner * inner * 0.45 * (1.0 + 2.4 * node)
    + uHalo * halo * 0.35 * (1.0 + 1.8 * node)
    + uHalo * haze * 0.06;

  return glow * pulse * ends;
}

void main() {
  vec3 glow = filament(gl_FragCoord.xy);

  // Chromatic aberration from the screen-space gradient: a shifted lookup without a second evaluation.
  vec3 slopeX = dFdx(glow);
  glow = max(glow + vec3(slopeX.r, 0.0, -slopeX.b) * uChroma, 0.0);

  vec2 uv = gl_FragCoord.xy / uResolution;
  float ramp = smoothstep(0.0, 1.0, clamp(dot(gl_FragCoord.xy - uRampFrom, uRampVec), 0.0, 1.0));
  vec2 edge = smoothstep(0.0, 0.14, min(uv, 1.0 - uv));
  float fog = mix(uMinGlow, 1.0, ramp)
    * edge.x * edge.y
    * (1.0 - 0.35 * smoothstep(0.35, 1.0, length(uv - 0.5)));

  vec3 color = uInk + (1.0 - exp(-glow * fog)) * (1.0 - uInk);

  // Grain only inside the canvas; it also breaks up banding in the dark tails.
  float lift = dot(color - uInk, vec3(0.3333));
  float noise = hash(gl_FragCoord.xy + floor(uTime * 24.0) * 31.7) - 0.5;
  color += noise * uGrain * mix(0.4, 1.0, clamp(lift * 6.0, 0.0, 1.0));

  fragColor = vec4(color, 1.0);
}
`;
