// SpiralGalaxy.jsx — Majestic 3-armed spiral galaxy, deep in the background

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ARM_COUNT = 3;
const STAR_COUNT = 6000;

export default function SpiralGalaxy() {
  const pointsRef = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);

    // Core colour: warm amber. Arms fade to cold violet at the edges
    const coreColor = new THREE.Color("#ffcc88");
    const midColor  = new THREE.Color("#ff8844");
    const edgeColor = new THREE.Color("#6622bb");

    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3;

      // Radius: biased toward the centre (core is dense)
      const radius = Math.pow(Math.random(), 0.7) * 28;
      const arm = i % ARM_COUNT;
      const baseAngle = (arm / ARM_COUNT) * Math.PI * 2;
      // Spin angle: outer stars lag behind — creates the spiral shape
      const spinAngle = radius * 0.45;

      // Spread perpendicular to arm (wider at edges)
      const spread = Math.pow(Math.random(), 2.5) * (Math.random() < 0.5 ? 1 : -1);
      const spreadX = spread * (1 + radius * 0.06);
      const spreadY = (Math.random() - 0.5) * (0.4 + radius * 0.03);
      const spreadZ = spread * (0.6 + radius * 0.04);

      positions[i3]     = Math.cos(baseAngle + spinAngle) * radius + spreadX;
      positions[i3 + 1] = spreadY;
      positions[i3 + 2] = Math.sin(baseAngle + spinAngle) * radius + spreadZ;

      // Colour: core=amber → mid=orange → edge=violet
      const t = radius / 28;
      const col = t < 0.4
        ? coreColor.clone().lerp(midColor, t / 0.4)
        : midColor.clone().lerp(edgeColor, (t - 0.4) / 0.6);

      // Core stars slightly brighter
      const brightness = t < 0.15 ? 1.4 : 1.0;
      colors[i3]     = col.r * brightness;
      colors[i3 + 1] = col.g * brightness;
      colors[i3 + 2] = col.b * brightness;

      // Core stars larger
      sizes[i] = t < 0.1 ? 2.5 : t < 0.3 ? 1.5 : 1.0;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      // Slow, majestic rotation
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    }
  });

  return (
    // Positioned deep behind the main planet, tilted for a dramatic angle
    <points ref={pointsRef} position={[2, -4, -30]} rotation={[0.3, 0.2, -0.1]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={STAR_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={STAR_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.14}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}
