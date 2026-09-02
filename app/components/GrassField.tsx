"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* Line-work is drawn, not filled, so the numbers that made a lush photographic
   field make a black smear instead. 42,000 solid green blades read as grass;
   42,000 ink strokes read as a bin bag. The count comes down and the blades get
   thinner, because here the paper showing between the strokes is doing as much
   work as the strokes — that is what makes it read as hatching rather than as a
   silhouette. */
const BLADE_COUNT = 17000;
const BLADE_SEGMENTS = 4;
const BLADE_HEIGHT = 0.52;
const BLADE_WIDTH = 0.019;
const FIELD_X = 24;
/* Pushed back from 4.5, but not as far as 0.6 — at 0.6 the field pulled away
   from the bottom of the frame entirely and left a strip of bare paper under
   it, so the grass read as a band floating across the middle of the screen.
   3.0 keeps strokes reaching the bottom edge while staying far enough from the
   lens that they are still strokes rather than slabs. */
const FIELD_NEAR = 3.0;
const FIELD_FAR = -36;
const HILL_RISE = 6.2;

/** Ground rises into the distance so the field climbs the hill. */
function groundY(x: number, z: number): number {
  const depth = (FIELD_NEAR - z) / (FIELD_NEAR - FIELD_FAR);
  const t = Math.max(0, Math.min(1, depth));
  const rise = t * t * HILL_RISE;
  const roll = Math.sin(x * 0.14 + t * 1.2) * 0.22 * t;
  return rise + roll;
}

/** Tall blades up close, short blades far away — matches perspective. Range
 *  flattened from 1.65..0.60: the drawing wants an even weight of mark across
 *  the field, not a dramatic near-to-far falloff. */
function bladeScale(z: number): number {
  const depth = (FIELD_NEAR - z) / (FIELD_NEAR - FIELD_FAR);
  const t = Math.max(0, Math.min(1, depth));
  return 0.95 - t * 0.5;
}

function makeBladeGeometry() {
  const positions: number[] = [];
  const heightFactor: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= BLADE_SEGMENTS; i++) {
    const t = i / BLADE_SEGMENTS;
    const y = t * BLADE_HEIGHT;
    const w = BLADE_WIDTH * (1 - t * 0.9);
    positions.push(-w, y, 0, w, y, 0);
    heightFactor.push(t, t);
  }
  for (let i = 0; i < BLADE_SEGMENTS; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }

  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute(
    "heightFactor",
    new THREE.Float32BufferAttribute(heightFactor, 1),
  );
  geo.setIndex(indices);

  const offset = new Float32Array(BLADE_COUNT * 3);
  const rot = new Float32Array(BLADE_COUNT);
  const scaleH = new Float32Array(BLADE_COUNT);
  const hash = new Float32Array(BLADE_COUNT);

  for (let i = 0; i < BLADE_COUNT; i++) {
    // Spread evenly through the field rather than piling up at the lens. The
    // old `random * random` stacked most of the 42,000 blades into the nearest
    // few units, which is what made the foreground lush — and, in ink, opaque.
    const zt = Math.pow(Math.random(), 0.85);
    const z = FIELD_NEAR + (FIELD_FAR - FIELD_NEAR) * zt;
    const depth = (FIELD_NEAR - z) / (FIELD_NEAR - FIELD_FAR);
    const x = (Math.random() * 2 - 1) * FIELD_X * (0.55 + 0.45 * depth);
    offset[i * 3] = x;
    offset[i * 3 + 1] = groundY(x, z);
    offset[i * 3 + 2] = z;
    rot[i] = Math.random() * Math.PI * 2;
    scaleH[i] = bladeScale(z) * (0.9 + Math.random() * 0.22);
    hash[i] = Math.random();
  }

  geo.setAttribute("offset", new THREE.InstancedBufferAttribute(offset, 3));
  geo.setAttribute("rot", new THREE.InstancedBufferAttribute(rot, 1));
  geo.setAttribute("scaleH", new THREE.InstancedBufferAttribute(scaleH, 1));
  geo.setAttribute("hash", new THREE.InstancedBufferAttribute(hash, 1));
  geo.instanceCount = BLADE_COUNT;
  return geo;
}

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uDissolve;
  uniform vec2 uPointer;
  uniform float uAspect;
  attribute float heightFactor;
  attribute vec3 offset;
  attribute float rot;
  attribute float scaleH;
  attribute float hash;
  varying float vH;
  varying float vHash;
  varying float vFog;
  varying float vDis;

  void main(){
    vH = heightFactor;
    vHash = hash;

    vec2 windDir = normalize(vec2(0.86, 0.5));

    // --- Disintegration -----------------------------------------------------
    // Every blade runs the same 0..1 curve, but starts at its own moment. The
    // stagger is part random (hash) and part depth, so the field comes apart
    // from the camera backwards instead of collapsing all at once. Max stagger
    // (0.45) plus the window (0.55) lands exactly on uDissolve = 1.
    float depth01 = clamp((offset.z + 36.0) / 40.5, 0.0, 1.0); // 0 far, 1 near
    float stagger = hash * 0.30 + (1.0 - depth01) * 0.15;
    float d = clamp((uDissolve - stagger) / 0.55, 0.0, 1.0);
    d = d * d * (3.0 - 2.0 * d);
    vDis = d;

    vec3 pos = position;
    // Only a light taper. The fragment shader eats the blade away from the base
    // now, so it no longer needs to be crushed to a stub as well — doing both
    // turned the near field into a row of hard little rectangles.
    pos.y *= scaleH * (1.0 - 0.3 * d);
    pos.x *= 1.0 - 0.2 * d;

    // ...and tumbles gently while it lifts. A full turn and a half (the old
    // range) is too fast to read at this scale and just looks like flicker.
    float spin = rot + d * (1.0 + hash * 2.6);
    float s = sin(spin), c = cos(spin);
    pos = vec3(pos.x * c - pos.z * s, pos.y, pos.x * s + pos.z * c);

    vec3 world = pos + offset;

    float hh = heightFactor * heightFactor;
    float sway = sin(uTime * 0.5 + offset.z * 0.05) * 0.5;
    float gust = sin(offset.x * 0.08 + offset.z * 0.12 - uTime * 0.6) * 0.9;
    float flutter = sin(uTime * 2.5 + hash * 6.2831) * 0.2;
    float wind = sway + gust + flutter;
    float bend = wind * 0.85 * hh * scaleH;
    world.x += windDir.x * bend;
    world.z += windDir.y * bend;

    // Torn loose: carried up and downwind, with a little scatter so the cloud
    // of blades has body rather than moving as one sheet. Eased on the way out
    // (d²) so blades leave the ground gently and gather speed, instead of
    // snapping upward the instant their turn comes.
    float carryEase = d * d;
    world.y += carryEase * (1.3 + hash * 2.8);
    float carry = carryEase * (1.0 + hash * 2.4);
    world.x += windDir.x * carry + sin(hash * 31.4) * carryEase * 1.2;
    world.z += windDir.y * carry + cos(hash * 17.7) * carryEase * 1.2;

    // --- Pointer wake ------------------------------------------------------
    // The cursor shoulders blades aside. Influence is measured in screen space
    // from each blade's *root*, which costs one extra projection: displacing
    // first and projecting afterwards would let a blade chase its own wake and
    // run away across the field.
    vec4 rootClip = projectionMatrix * modelViewMatrix * vec4(offset, 1.0);
    vec2 rootNdc = rootClip.xy / max(abs(rootClip.w), 0.0001);
    vec2 fromPointer = (rootNdc - uPointer) * vec2(uAspect, 1.0);
    float pd = length(fromPointer);
    // hh weights the bend toward the tip, so blades pivot from the ground
    // rather than sliding sideways as rigid sticks.
    float push = smoothstep(0.62, 0.0, pd) * hh * scaleH * (1.0 - d);
    vec2 away = fromPointer / max(pd, 0.0001);
    world.x += away.x * push * 0.6;
    world.z -= away.y * push * 0.3;
    // Barely any downward press. At 0.1 it dug a visible crater with bare
    // ground at the bottom; the blades should lean, not be stamped flat.
    world.y -= push * 0.035;

    vec4 mv = modelViewMatrix * vec4(world, 1.0);
    vFog = clamp((-mv.z - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uBase;
  uniform vec3 uTip;
  uniform vec3 uFogColor;
  uniform vec2 uResolution;
  varying float vH;
  varying float vHash;
  varying float vFog;
  varying float vDis;

  float hash11(float p){
    return fract(sin(p) * 43758.5453);
  }

  void main(){
    // A drawn stroke, not a lit surface. The blade runs from full ink at the
    // root to the secondary grey at the tip, which is what a real pen does as
    // it lifts — and it stops the field reading as a solid black mass where the
    // strokes crowd together near the camera.
    vec3 col = mix(uBase, uTip, vH * vH);

    // Per-blade pressure. Some strokes are laid down harder than others; this
    // one line is most of the difference between hatching and a texture fill.
    // It leans light (0.30..1.0) because ink only ever subtracts from paper.
    float pressure = 0.30 + hash11(vHash * 7.13) * 0.70;
    col = mix(uFogColor, col, pressure);

    // The very tip fades out rather than ending square, so a blade finishes
    // like a stroke instead of a cut wire.
    col = mix(col, uFogColor, smoothstep(0.72, 1.0, vH) * 0.55);

    col = mix(col, uFogColor, vFog);

    // Eat each blade away from the base upward as it lifts.
    //
    // The obvious approach — threshold a per-pixel random number — is what this
    // used to do, and it reads as television static: white noise has no spatial
    // coherence, so the blade breaks into flickering speckle. Cutting along the
    // blade's own height instead gives a clean edge that travels, and one
    // random offset *per blade* keeps the field from dissolving in lockstep.
    if (vDis > 0.001) {
      float ragged = (hash11(vHash * 91.7) - 0.5) * 0.18;
      if (vH < vDis * 1.15 + ragged) discard;
      // What is still airborne lightens toward the paper as it goes, so the
      // field thins out of the drawing rather than flying off it.
      col = mix(col, uFogColor, smoothstep(0.0, 1.0, vDis) * 0.85);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Seconds for the whole field to come apart once `dissolving` flips. Tuned
 *  against the gate's cloud timings so the field is gone before the cover
 *  closes — dissolving underneath an opaque wash is work nobody sees. */
const DISSOLVE_SECONDS = 1.4;

function Grass({ dissolving }: { dissolving: boolean }) {
  const geo = useMemo(() => makeBladeGeometry(), []);
  const mat = useRef<THREE.ShaderMaterial>(null);

  // Where the pointer is (`to`) versus where the wake has caught up to (`at`).
  // Tracked on window rather than through R3F's pointer, because the canvas
  // sits under `pointer-events-none` and never receives the events itself.
  const wake = useRef({ atX: 0, atY: -3, toX: 0, toY: -3, seen: false });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const w = wake.current;
      w.toX = (e.clientX / window.innerWidth) * 2 - 1;
      w.toY = -((e.clientY / window.innerHeight) * 2 - 1);
      if (!w.seen) {
        // Start the wake under the pointer instead of dragging it in from the
        // parked position, which would sweep the whole field on first move.
        w.seen = true;
        w.atX = w.toX;
        w.atY = w.toY;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      // Aerial perspective, done as an etcher would: the far field is not
      // hazier, it is simply less drawn. Pulled in from 6/32 so strokes are
      // already thinning out by mid-field and the horizon is bare paper.
      uFogNear: { value: 3 },
      uFogFar: { value: 21 },
      // Set from the site's own hexes via setStyle, which converts sRGB into
      // the renderer's working space. Passing the components straight to the
      // constructor (as the green version did) skips that conversion and
      // quietly lands on a different colour than the CSS token names.
      uBase: { value: new THREE.Color().setStyle("#0b0b0b") }, // --color-ink
      uTip: { value: new THREE.Color().setStyle("#6d6b64") }, // --color-ink-2
      uFogColor: { value: new THREE.Color().setStyle("#f2efe9") }, // --color-paper
      uResolution: { value: new THREE.Vector2(1, 1) },
      uDissolve: { value: 0 },
      // Parked off-screen so the field sits still until the pointer arrives.
      uPointer: { value: new THREE.Vector2(0, -3) },
      uAspect: { value: 1 },
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uResolution.value.set(
      state.size.width * state.viewport.dpr,
      state.size.height * state.viewport.dpr,
    );
    u.uAspect.value = state.size.width / Math.max(state.size.height, 1);

    // The wake trails the cursor. Frame-rate independent, so it settles at the
    // same speed on 60Hz and 144Hz.
    const w = wake.current;
    const k = 1 - Math.pow(0.0001, Math.min(delta, 1 / 30));
    w.atX += (w.toX - w.atX) * k;
    w.atY += (w.toY - w.atY) * k;
    u.uPointer.value.set(w.atX, w.atY);

    // A fixed-rate ramp rather than an ease toward a target: the gate's other
    // beats are scheduled against the clock, so this one has to finish when it
    // says it will. `delta` is clamped because a background tab can hand back
    // a huge first frame, which would snap the field apart in one step.
    if (dissolving && u.uDissolve.value < 1) {
      u.uDissolve.value = Math.min(
        1,
        u.uDissolve.value + Math.min(delta, 1 / 30) / DISSOLVE_SECONDS,
      );
    }
  });

  return (
    <mesh geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Rig() {
  const { camera } = useThree();
  useMemo(() => {
    camera.position.set(0, 1.55, 9);
    camera.lookAt(0, 3.2, -22);
  }, [camera]);
  return null;
}

export default function GrassField({
  dissolving = false,
}: {
  /** Flip once, on the way out: the field tears loose and blows away. */
  dissolving?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2]">
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.55, 9], fov: 44, near: 0.1, far: 120 }}
      >
        <Rig />
        <ambientLight intensity={0.42} color="#9aacbf" />
        <directionalLight position={[-4, 9, 3]} intensity={0.85} color="#c4d0e4" />
        <Grass dissolving={dissolving} />
      </Canvas>
    </div>
  );
}
