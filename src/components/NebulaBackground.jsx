// NebulaBackground.jsx — Volumetric-looking nebula using layered additive planes

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Each entry is a glowing coloured nebula cloud deep in the background
const CLOUDS = [
  { pos: [ 0,   0, -90], rot: [0,     0,    0    ], size: 180, color: "#1a0840", opacity: 0.9 },
  { pos: [-30,  12, -80], rot: [0.15,  0.3,  0    ], size: 120, color: "#0a1858", opacity: 0.7 },
  { pos: [ 28, -10, -85], rot: [-0.1, -0.2,  0.08 ], size: 130, color: "#280840", opacity: 0.6 },
  { pos: [ 10,  25, -95], rot: [ 0.08, 0,   -0.12 ], size: 140, color: "#080e28", opacity: 0.5 },
  { pos: [-15, -20, -75], rot: [ 0.2, -0.1,  0.05 ], size: 100, color: "#0e1830", opacity: 0.5 },
  // Bright nebula pockets — pops of colour
  { pos: [ 40,  20, -70], rot: [0, 0.4, 0], size: 60,  color: "#3a0858", opacity: 0.35 },
  { pos: [-35, -15, -72], rot: [0.3, 0, 0], size: 55,  color: "#081840", opacity: 0.30 },
  { pos: [  5,  30, -88], rot: [0,   0, 0], size: 75,  color: "#200a40", opacity: 0.25 },
];

// Procedurally generated nebula texture using a canvas radial gradient
function makeNebulaTexture(color) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const cx = size / 2, cy = size / 2;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0, color + "ff");
  grad.addColorStop(0.35, color + "aa");
  grad.addColorStop(0.65, color + "44");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function NebulaBackground() {
  const groupRef = useRef();

  // Generate textures ONCE on mount, not every render!
  const cloudTextures = useMemo(() => {
    return CLOUDS.map(c => makeNebulaTexture(c.color));
  }, []);

  useEffect(() => {
    return () => {
      cloudTextures.forEach(tex => tex.dispose());
    };
  }, [cloudTextures]);

  useFrame((state) => {
    if (groupRef.current) {
      // Very slow drift
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.003;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.002) * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {CLOUDS.map((c, i) => {
        return (
          <mesh
            key={i}
            position={c.pos}
            rotation={c.rot}
          >
            <planeGeometry args={[c.size, c.size]} />
            <meshBasicMaterial
              map={cloudTextures[i]}
              transparent
              opacity={c.opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}
