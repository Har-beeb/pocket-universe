import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Sphere } from "@react-three/drei";
import * as THREE from "three";

export default function LockedPlanet({ chapter }) {
  const meshRef = useRef();
  const [timeLeft, setTimeLeft] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (!chapter.unlockDate) return;

    const targetDate = new Date(chapter.unlockDate).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setIsUnlocked(true);
        setTimeLeft("UNLOCKED");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [chapter.unlockDate]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.001;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y =
      chapter.position[1] + Math.sin(t * 0.3 + chapter.id.length) * 0.08;
  });

  return (
    <group position={chapter.position}>
      {/* Very faint glow */}
      <Sphere args={[chapter.planetSize * 1.3, 32, 32]}>
        <meshBasicMaterial
          color={isUnlocked ? "#ffcc88" : "#334455"}
          transparent
          opacity={isUnlocked ? 0.2 : 0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Planet body — dark, desaturated */}
      <mesh ref={meshRef} onClick={() => {
        if (isUnlocked) {
          alert("Audio voice note playing: 'Happy birthday my love, this is the future we talked about...'");
        }
      }}>
        <sphereGeometry args={[chapter.planetSize, 48, 48]} />
        <meshStandardMaterial
          color={isUnlocked ? "#cc8844" : "#1a2233"}
          emissive={isUnlocked ? "#ffaa55" : "#050a12"}
          emissiveIntensity={isUnlocked ? 0.6 : 0.1}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Label with lock icon or countdown */}
      <Html
        center
        position={[0, chapter.planetSize + 0.6, 0]}
        distanceFactor={12}
        occlude
      >
        <div
          className="text-center pointer-events-none select-none"
          style={{ opacity: isUnlocked ? 1 : 0.6, transition: "opacity 1s" }}
        >
          <div
            style={{
              fontSize: "14px",
              marginBottom: "3px",
              color: isUnlocked ? "#ffcc88" : "white"
            }}
          >
            {isUnlocked ? "♥" : "✦"}
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "12px",
              color: isUnlocked ? "#ffddaa" : "#8899aa",
              letterSpacing: "0.2em",
              marginBottom: chapter.unlockDate ? "4px" : "0"
            }}
          >
            {chapter.year}
          </div>
          {chapter.unlockDate && (
            <div
              style={{
                fontFamily: "'Inter', monospace",
                fontSize: "10px",
                color: isUnlocked ? "#fff" : "#ff4444",
                letterSpacing: "0.15em",
                background: "rgba(0,0,0,0.6)",
                padding: "2px 8px",
                borderRadius: "12px",
                border: `1px solid ${isUnlocked ? "rgba(255,255,255,0.4)" : "rgba(255,68,68,0.3)"}`,
                boxShadow: isUnlocked ? "0 0 10px rgba(255,255,255,0.2)" : "0 0 10px rgba(255,0,0,0.2)"
              }}
            >
              {timeLeft || "CALCULATING..."}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
