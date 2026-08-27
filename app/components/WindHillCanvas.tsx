"use client";

import { useEffect, useRef } from "react";
import { HILLS_GLSL } from "./hills";

const VERT = /* glsl */ `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform vec2 u_res;
uniform float u_time;

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for(int i = 0; i < 5; i++){ s += a * vnoise(p); p *= 2.0; a *= 0.5; }
  return s;
}
${HILLS_GLSL}

// Layered star field: dense dust, medium stars, rare bright ones with halos.
float starLayer(vec2 p, float density, float threshold, float sizeBase){
  vec2 uv = p * vec2(u_res.x / u_res.y * density, density);
  vec2 id = floor(uv);
  vec2 gv = fract(uv) - 0.5;
  float n = hash21(id);
  float n2 = hash21(id + 41.17);
  float pick = step(threshold, n);
  float sz = sizeBase * (0.55 + n2 * 0.9);
  float d = length(gv);
  float core = smoothstep(sz, sz * 0.08, d);
  float halo = smoothstep(sz * 4.0, 0.0, d) * 0.3;
  return pick * (core + halo);
}

vec3 starColor(float n){
  return mix(vec3(0.82, 0.86, 1.0), vec3(1.0, 0.94, 0.82), step(0.72, n));
}

float segDist(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

// A falling star. Time is cut into period-long cycles; a streak crosses the
// sky during the first ~1.1s of a cycle and most cycles are skipped outright,
// so they stay a surprise rather than a metronome. The skip roll uses its own
// hash — reusing the direction's would tie *whether* a star falls to *where*
// it falls, and the same few trajectories would be the only ones ever seen.
float meteor(vec2 p, float aspect, float t, float seed, float period){
  float cycle = t / period + seed;
  float idx = floor(cycle);
  float secs = fract(cycle) * period;

  const float dur = 1.1;
  if (secs > dur) return 0.0;

  float appear = hash21(vec2(idx * 5.3 + 1.7, seed * 19.1));
  if (appear < 0.6) return 0.0;

  float k = secs / dur;
  float r1 = hash21(vec2(idx, seed * 31.7));
  float r2 = hash21(vec2(idx * 1.7 + 3.1, seed * 12.3));
  float r3 = hash21(vec2(idx * 2.9 + 7.3, seed * 5.9));

  vec2 start = vec2(mix(-0.05, 1.05, r1), mix(-0.04, 0.20, r2));
  vec2 dir = normalize(vec2(mix(-0.8, 0.8, r3), 0.55));

  vec2 head = start + dir * 0.52 * k;
  // The tail grows as it accelerates in, then is swallowed on the way out.
  float tailLen = 0.15 * smoothstep(0.0, 0.25, k) * (1.0 - smoothstep(0.7, 1.0, k));
  vec2 tail = head - dir * tailLen;

  vec2 q = p * vec2(aspect, 1.0);
  float dist = segDist(q, head * vec2(aspect, 1.0), tail * vec2(aspect, 1.0));
  float core = smoothstep(0.0026, 0.0, dist);
  float glow = smoothstep(0.014, 0.0, dist) * 0.3;
  float fade = smoothstep(0.0, 0.1, k) * (1.0 - smoothstep(0.72, 1.0, k));
  return (core + glow) * fade;
}

// Photo-like surface grain — coarse clumps + fine speckle.
vec3 surfaceNoise(vec2 screenPx, vec3 col, float strength){
  float coarse = fbm(screenPx * 0.004);
  float fine = hash21(floor(screenPx * 1.4));
  float grain = coarse * 0.55 + fine * 0.45;
  col *= 0.86 + grain * strength;
  col += (fine - 0.5) * strength * 0.11;
  return col;
}

void main(){
  vec2 uv = v_uv;
  vec2 p = vec2(uv.x, 1.0 - uv.y);
  float aspect = u_res.x / u_res.y;

  // ---- NIGHT SKY ----
  vec3 skyTop = vec3(0.012, 0.018, 0.05);
  vec3 skyMid = vec3(0.025, 0.04, 0.11);
  vec3 skyHorizon = vec3(0.05, 0.07, 0.16);
  vec3 col = mix(skyTop, skyMid, smoothstep(0.0, 0.62, p.y));
  col = mix(col, skyHorizon, smoothstep(0.55, 0.88, p.y));

  // faint horizon glow — sits just above the distant hills
  float moonGlow = smoothstep(0.42, 0.0, length((p - vec2(0.5, 0.62)) * vec2(1.0, 2.2)));
  col += vec3(0.035, 0.045, 0.08) * moonGlow;

  // ---- STARS (drawn before hills so they stay visible in open sky) ----
  float cFarEarly = hill_far(p.x);
  float skyMask = smoothstep(cFarEarly - 0.06, 0.02, p.y);
  // sizeBase is in CELL units, not screen units — a cell is 1/density of the
  // viewport height. The values here were originally ~0.003, which at density
  // 95 is a core radius of about 0.03 PIXELS: the sky read as empty not because
  // the stars were dim but because they were sub-pixel and only lit up when a
  // pixel centre happened to land on one. These give cores of roughly 0.5px,
  // 1.2px and 3px.
  float dust = starLayer(p, 95.0, 0.940, 0.055);
  float medium = starLayer(p, 72.0, 0.970, 0.10);
  float bright = starLayer(p, 52.0, 0.987, 0.17);
  float nBright = hash21(floor(p * vec2(u_res.x / u_res.y * 52.0, 52.0)));
  float tw = 0.6 + 0.4 * sin(u_time * 1.05 + nBright * 47.0);
  vec3 starCol =
    vec3(0.66, 0.70, 0.88) * dust * 0.9 +
    starColor(hash21(floor(p * vec2(u_res.x / u_res.y * 72.0, 72.0)))) * medium * 1.2 +
    starColor(nBright) * bright * tw * 1.6;
  col += starCol * skyMask;

  // Two independent streams on different clocks, so they never pair up.
  float shooting =
    meteor(p, aspect, u_time, 0.13, 9.0) +
    meteor(p, aspect, u_time, 0.67, 14.0);
  // 2.2 rather than 1.0: at unit brightness the streak was there but too faint
  // to notice against the star field, and at 6.0 it read as a laser.
  col += vec3(0.96, 0.97, 1.0) * shooting * 3.0 * skyMask;
  col = surfaceNoise(p * u_res, col, 0.06);

  // ---- ROLLING HILLS (back → front) ----
  float cFar = hill_far(p.x);
  float cMid = hill_mid(p.x);
  float cNear = hill_near(p.x);

  float maskFar = smoothstep(cFar - 0.006, cFar + 0.006, p.y);
  float maskMid = smoothstep(cMid - 0.006, cMid + 0.006, p.y);
  float maskNear = smoothstep(cNear - 0.006, cNear + 0.006, p.y);

  vec3 farCol = mix(vec3(0.03, 0.08, 0.11), vec3(0.05, 0.14, 0.13), fbm(p * 4.0));
  farCol = surfaceNoise(p * u_res, farCol, 0.12);

  vec3 midCol = mix(vec3(0.04, 0.14, 0.10), vec3(0.07, 0.22, 0.14), fbm(p * 5.0 + 2.0));
  midCol = surfaceNoise(p * u_res + 17.0, midCol, 0.15);

  float depthNear = clamp((p.y - cNear) / (1.0 - cNear), 0.0, 1.0);
  vec3 grassLight = vec3(0.16, 0.44, 0.15);
  vec3 grassDeep = vec3(0.03, 0.13, 0.05);
  vec3 nearCol = mix(grassLight, grassDeep, smoothstep(0.0, 0.92, depthNear));

  // wind ripples on the foreground hill
  float gust = fbm(vec2(p.x * 3.0 - u_time * 0.12, p.y * 6.0 + fbm(p * 2.5) * 0.6));
  float ripple = sin(p.x * 18.0 - u_time * 1.2 + fbm(p * 3.0) * 4.0) * 0.5 + 0.5;
  float wind = mix(gust, ripple, 0.35);
  float windAmt = 0.14 * (1.0 - depthNear * 0.5);
  nearCol *= (1.0 - windAmt) + windAmt * 1.75 * wind;

  nearCol = surfaceNoise(p * u_res + 33.0, nearCol, 0.18);

  col = mix(col, farCol, maskFar);
  col = mix(col, midCol, maskMid);
  col = mix(col, nearCol, maskNear);

  // ---- FILM GRAIN (screen-space) ----
  vec2 px = uv * u_res;
  float g1 = hash21(floor(px));
  float g2 = hash21(floor(px * 0.37 + 13.7));
  col += (g1 * 0.65 + g2 * 0.35 - 0.5) * 0.09;

  // ---- VIGNETTE ----
  float vig = smoothstep(1.15, 0.4, length((uv - 0.5) * vec2(aspect, 1.0)));
  col *= mix(0.88, 1.0, vig);

  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("Shader compile error: " + log);
  }
  return sh;
}

export default function WindHillCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let raf = 0;
    let start = performance.now();

    function resize() {
      if (!gl) return;
      const w = Math.floor(canvas!.clientWidth * dpr());
      const h = Math.floor(canvas!.clientHeight * dpr());
      if (w === 0 || h === 0) return;
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
      gl.viewport(0, 0, canvas!.width, canvas!.height);
      if (uRes) gl.uniform2f(uRes, canvas!.width, canvas!.height);
    }

    function frame(now: number) {
      if (!gl || gl.isContextLost()) return;
      const t = (now - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }

    function setup(): boolean {
      if (!gl) return false;
      try {
        program = gl.createProgram()!;
        gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw new Error(gl.getProgramInfoLog(program) ?? "link failed");
        }
      } catch (err) {
        console.error("[WindHillCanvas]", err);
        return false;
      }

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      const aPos = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.useProgram(program);
      uRes = gl.getUniformLocation(program, "u_res");
      uTime = gl.getUniformLocation(program, "u_time");

      resize();

      if (reduced) {
        gl.uniform1f(uTime, 12.0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      } else {
        start = performance.now();
        raf = requestAnimationFrame(frame);
      }
      return true;
    }

    function onLost(e: Event) {
      e.preventDefault();
      cancelAnimationFrame(raf);
    }
    function onRestored() {
      setup();
    }

    canvas.addEventListener("webglcontextlost", onLost, false);
    canvas.addEventListener("webglcontextrestored", onRestored, false);
    window.addEventListener("resize", resize);

    setup();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-hidden="true"
      style={{
        background:
          "linear-gradient(to bottom, oklch(0.12 0.04 265) 0%, oklch(0.16 0.05 265) 50%, oklch(0.20 0.07 155) 72%, oklch(0.15 0.07 150) 100%)",
      }}
    />
  );
}
