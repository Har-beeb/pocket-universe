// Planet.jsx — Photo-realistic procedural planets using FBM noise

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SCENE } from "../App";

// ─── MATH HELPERS ────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const smooth = (x) => x * x * (3 - 2 * x);

// Deterministic hash → [0,1)
function hash(x, y) {
  return Math.abs(Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1;
}

// Smooth value noise
function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = smooth(fx), uy = smooth(fy);
  return lerp(
    lerp(hash(ix, iy), hash(ix + 1, iy), ux),
    lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), ux),
    uy
  );
}

// Fractal Brownian Motion — stacks octaves of noise for organic look
function fbm(x, y, octaves = 6) {
  let v = 0, amp = 0.5, freq = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    v += noise(x * freq, y * freq) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return v / max;
}

// HSL → [r,g,b] each 0–255
function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// ─── OCEAN / EARTH-LIKE PLANET ───────────────────────────────
function makeOceanTexture(oceanHue = 210, landHue = 130, seedOffset = 0) {
  const W = 512, H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(W, H);
  const d = img.data;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Spherical coordinates for seamless wrap
      const nx = (x / W) * 5.5 + seedOffset;
      const ny = (y / H) * 2.5 + seedOffset;
      const n = fbm(nx, ny, 7);

      // Latitude-based polar darkening
      const lat = Math.abs((y / H) - 0.5) * 2; // 0=equator, 1=pole
      const polarFade = clamp(1 - lat * 0.6, 0.4, 1.0);

      let r, g, b;

      if (lat > 0.82) {
        // Polar ice caps
        const iceBlend = clamp((lat - 0.82) / 0.18, 0, 1);
        const iceN = fbm(nx * 3, ny * 3, 3);
        const brightness = 85 + iceN * 15;
        r = g = b = 220 + brightness * 0.35;
        // Blend with what's below
        const belowN = n;
        const belowIsLand = belowN > 0.52;
        const [br, bg, bb] = belowIsLand
          ? hsl(landHue, 30 + belowN * 20, 22 + belowN * 18)
          : hsl(oceanHue, 65, 18 + belowN * 14);
        r = lerp(br, r, iceBlend);
        g = lerp(bg, g, iceBlend);
        b = lerp(bb, b, iceBlend);
      } else if (n > 0.545) {
        // Land — multi-layer terrain
        const elevation = (n - 0.545) / 0.455;
        if (elevation > 0.7) {
          // Mountain peaks with snow
          const snowBlend = clamp((elevation - 0.7) / 0.3, 0, 1);
          const [lr, lg, lb] = hsl(landHue, 20, 40 + elevation * 20);
          const snowL = 85 + elevation * 10;
          r = lerp(lr, snowL, snowBlend * 0.9);
          g = lerp(lg, snowL, snowBlend * 0.9);
          b = lerp(lb, snowL + 5, snowBlend * 0.9);
        } else if (elevation > 0.35) {
          // Highlands / rocky terrain
          [r, g, b] = hsl(landHue + 5, 25, 28 + elevation * 18);
        } else {
          // Lowlands / vegetation
          [r, g, b] = hsl(landHue + 10, 38, 20 + elevation * 22);
        }
        // Darken toward poles
        r *= polarFade; g *= polarFade; b *= polarFade;
      } else {
        // Ocean — depth-based colouring
        const depth = clamp((0.545 - n) / 0.545, 0, 1);
        const lightness = 18 - depth * 10;
        const saturation = 70 + depth * 10;
        [r, g, b] = hsl(oceanHue + fbm(nx * 2, ny * 2, 3) * 15, saturation, lightness);
        r *= polarFade; g *= polarFade; b *= polarFade;
      }

      const idx = (y * W + x) * 4;
      d[idx]     = clamp(r, 0, 255);
      d[idx + 1] = clamp(g, 0, 255);
      d[idx + 2] = clamp(b, 0, 255);
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

// ─── GAS GIANT ───────────────────────────────────────────────
function makeGasTexture(c1 = "#1a0535", c2 = "#7030b0", c3 = "#4a1a80") {
  const W = 512, H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(W, H);
  const d = img.data;

  const rgb1 = hexRgb(c1), rgb2 = hexRgb(c2), rgb3 = hexRgb(c3);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const ny = y / H;
      const nx = x / W;

      // Turbulence — displaces the x coordinate horizontally
      const turb = fbm(nx * 2.5, ny * 4, 5) - 0.5;
      const bandX = (nx + turb * 0.25 + ny * 0.1) % 1;

      // Multi-layer banding
      const band1 = (Math.sin(ny * Math.PI * 14) + 1) * 0.5;
      const band2 = (Math.sin(ny * Math.PI * 6 + 1.2) + 1) * 0.5;
      const band3 = fbm(nx * 1.5 + turb, ny * 8, 4);

      const mix = band1 * 0.5 + band2 * 0.3 + band3 * 0.2;

      let r = lerp(lerp(rgb1.r, rgb2.r, mix), rgb3.r, band3 * 0.4);
      let g = lerp(lerp(rgb1.g, rgb2.g, mix), rgb3.g, band3 * 0.4);
      let b = lerp(lerp(rgb1.b, rgb2.b, mix), rgb3.b, band3 * 0.4);

      // Bright highlight streaks
      const streak = fbm(bandX * 8, ny * 12, 3);
      if (streak > 0.68) {
        const s = (streak - 0.68) / 0.32;
        r = lerp(r, 230, s * 0.3);
        g = lerp(g, 200, s * 0.25);
        b = lerp(b, 255, s * 0.35);
      }

      // Great Storm oval
      const stormX = 0.3, stormY = 0.55;
      const dx = (nx - stormX) * 2.5, dy = (ny - stormY) * 4;
      const stormR = Math.sqrt(dx * dx + dy * dy);
      if (stormR < 0.12) {
        const sf = 1 - stormR / 0.12;
        const [sr, sg, sb] = hsl(15, 70, 35 + sf * 25);
        r = lerp(r, sr, sf * 0.8);
        g = lerp(g, sg, sf * 0.8);
        b = lerp(b, sb, sf * 0.8);
      }

      const idx = (y * W + x) * 4;
      d[idx]     = clamp(r, 0, 255);
      d[idx + 1] = clamp(g, 0, 255);
      d[idx + 2] = clamp(b, 0, 255);
      d[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function hexRgb(hex) {
  const s = hex.replace("#", "");
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16),
  };
}

// ─── CLOUD TEXTURE ───────────────────────────────────────────
function makeCloudTexture() {
  const W = 512, H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(W, H);
  const d = img.data;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = (x / W) * 4.5, ny = (y / H) * 2.2;
      const n = fbm(nx + 2.5, ny + 8, 6);
      const cloud = clamp((n - 0.42) / 0.32, 0, 1);
      const idx = (y * W + x) * 4;
      d[idx] = d[idx + 1] = d[idx + 2] = 255;
      d[idx + 3] = Math.round(cloud * 180);
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

// ─── RING TEXTURE ────────────────────────────────────────────
function makeRingTexture(inner = "#aa66ff", outer = "#cc99ff") {
  const W = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = 1;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0,    "rgba(0,0,0,0)");
  grad.addColorStop(0.04, inner + "aa");
  grad.addColorStop(0.12, outer + "ff");
  grad.addColorStop(0.22, inner + "cc");
  grad.addColorStop(0.28, inner + "11");   // mini gap
  grad.addColorStop(0.33, outer + "ff");
  grad.addColorStop(0.44, inner + "dd");
  grad.addColorStop(0.48, "rgba(0,0,0,0)"); // Cassini Division
  grad.addColorStop(0.52, "rgba(0,0,0,0)");
  grad.addColorStop(0.56, outer + "cc");
  grad.addColorStop(0.68, inner + "bb");
  grad.addColorStop(0.80, outer + "66");
  grad.addColorStop(0.92, inner + "22");
  grad.addColorStop(1,    "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 1);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ─── PLANET COMPONENT ────────────────────────────────────────
export default function Planet({ chapter, isSelected, scene, onClick }) {
  const groupRef = useRef();
  const bodyRef  = useRef();
  const cloudRef = useRef();
  const atmoRef  = useRef();
  const ringRef  = useRef();
  const [hovered, setHovered] = useState(false);

  const isInGalaxy = scene === SCENE.GALAXY;
  const isInPlanet = scene === SCENE.PLANET;
  const s = chapter.planetSize;

  // Planet scale remains constant at 1.0; the environment zooming in provides all the motion.


  const textures = useMemo(() => {
    const isGas = chapter.planetType === "gas";
    return {
      body: isGas
        ? makeGasTexture(chapter.gasColor1, chapter.gasColor2, chapter.gasColor3)
        : makeOceanTexture(chapter.oceanHue ?? 210, chapter.landHue ?? 130, chapter.id === "the_past" ? 42.5 : 0),
      clouds: makeCloudTexture(),
      ring: chapter.hasRings
        ? makeRingTexture(chapter.ringInnerColor, chapter.ringOuterColor)
        : null,
    };
  }, [chapter]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!groupRef.current) return;
    groupRef.current.position.y =
      chapter.position[1] + Math.sin(t * 0.42 + chapter.id.length) * 0.18;

    if (bodyRef.current)  bodyRef.current.rotation.y  += 0.0013;
    if (cloudRef.current) { cloudRef.current.rotation.y += 0.0019; cloudRef.current.rotation.x += 0.00015; }
    if (ringRef.current)  ringRef.current.rotation.y  -= 0.0015; // Slow majestic ring spin

    if (atmoRef.current) {
      atmoRef.current.scale.setScalar(1 + Math.sin(t * 0.85) * 0.015);
      atmoRef.current.material.opacity = hovered ? 0.35 : 0.16;
    }
  });

  return (
    <group ref={groupRef} position={chapter.position}>
      {/* Outer atmosphere glow */}
      <mesh ref={atmoRef} scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[s, 24, 16]} />
        <meshBasicMaterial color={chapter.planetColor} side={THREE.BackSide} transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Second halo - tighter */}
      <mesh scale={[1.04, 1.04, 1.04]}>
        <sphereGeometry args={[s, 24, 16]} />
        <meshBasicMaterial color={chapter.planetColor} side={THREE.BackSide} transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Planet surface */}
      <mesh ref={bodyRef}
        onPointerDown={isInGalaxy ? (e) => { e.stopPropagation(); onClick(); } : undefined}
        onPointerEnter={() => isInGalaxy && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        style={{ cursor: isInGalaxy ? "pointer" : "default" }}
      >
        <sphereGeometry args={[s, 64, 32]} />
        <meshStandardMaterial map={textures.body} roughness={0.88} metalness={0.04} emissive={chapter.planetColor} emissiveIntensity={hovered ? 0.10 : 0.02} />
      </mesh>

      {/* Cloud layer (ocean only) */}
      {chapter.planetType !== "gas" && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[s * 1.019, 48, 24]} />
          <meshStandardMaterial map={textures.clouds} transparent opacity={0.52} depthWrite={false} roughness={1} metalness={0} />
        </mesh>
      )}

      {/* Rings */}
      {chapter.hasRings && textures.ring && (
        <group rotation={[Math.PI / 6, 0, chapter.ringTilt ?? 0.4]}>
          <group ref={ringRef}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[s * 1.55, s * 2.9, 128]} />
              <meshBasicMaterial map={textures.ring} transparent opacity={0.94} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[s * 1.48, s * 1.52, 64]} />
              <meshBasicMaterial color={chapter.ringInnerColor ?? "#aa66ff"} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[s * 2.9, s * 3.3, 32]} />
              <meshBasicMaterial color={chapter.ringOuterColor ?? "#cc99ff"} transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
        </group>
      )}

      {/* Galaxy view label */}
      {isInGalaxy && (
        <Html center position={[0, s + (chapter.hasRings ? 1.6 : 0.75), 0]} distanceFactor={14} occlude>
          <div className="text-center pointer-events-none select-none" style={{ opacity: hovered ? 1 : 0.6, transform: hovered ? "scale(1.1) translateY(-3px)" : "scale(1)", transition: "all 0.35s ease", textShadow: `0 0 22px ${chapter.planetColor}bb` }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "15px", color: "#fff", letterSpacing: "0.18em", whiteSpace: "nowrap" }}>{chapter.name}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(200,215,255,0.55)", letterSpacing: "0.22em", marginTop: "3px" }}>{chapter.year}</div>
          </div>
        </Html>
      )}

      {/* Zoomed chapter title */}
      {isInPlanet && isSelected && (
        <Html center position={[0, s + 0.6, 0]} distanceFactor={5}>
          <div className="text-center pointer-events-none" style={{ animation: "fadeInUp 1.4s cubic-bezier(0.16,1,0.3,1) forwards" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", color: "#fff", textShadow: `0 0 30px ${chapter.planetColor}`, margin: 0 }}>{chapter.name}</h2>
          </div>
        </Html>
      )}
    </group>
  );
}
