// ShootingStars.jsx — Animated meteor streaks across the background

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ANGLE = -Math.atan2(12, 30); // diagonal down-right angle

function ShootingStar({ startX, startY, speed, length, delay }) {
  const meshRef = useRef();
  const t = useRef(-delay);

  useFrame((_, delta) => {
    t.current += delta * speed;
    // Loop: reset when star has crossed the screen
    if (t.current > 1.6) t.current = -(Math.random() * 3);

    if (!meshRef.current) return;
    if (t.current < 0) { meshRef.current.visible = false; return; }
    meshRef.current.visible = true;

    const progress = t.current;
    // Fly diagonally across the background plane
    meshRef.current.position.x = startX + progress * 34;
    meshRef.current.position.y = startY - progress * 13;

    // Smooth sine-based fade in and out instead of harsh linear piecewise
    let fade = 0;
    if (progress < 0.2) {
      fade = Math.sin((progress / 0.2) * (Math.PI / 2)); // Ease out sine for fade in
    } else if (progress > 1.0) {
      fade = Math.cos(((progress - 1.0) / 0.6) * (Math.PI / 2)); // Ease in sine for fade out
    } else {
      fade = 1;
    }
    
    meshRef.current.material.opacity = Math.max(0, fade) * 0.92;
  });

  return (
    <mesh ref={meshRef} rotation={[0, 0, ANGLE]} position={[startX, startY, -18]} visible={false}>
      {/* Main streak */}
      <boxGeometry args={[length, 0.025, 0.001]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function ShootingStars() {
  const configs = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        startX: -35 + (Math.random() - 0.5) * 25,
        startY: 12 + Math.random() * 14,
        speed: 0.22 + Math.random() * 0.28,
        length: 1.2 + Math.random() * 3.5,
        delay: i * 1.2 + Math.random() * 3,
      })),
    []
  );

  return (
    <>
      {configs.map((c, i) => (
        <ShootingStar key={i} {...c} />
      ))}
    </>
  );
}
