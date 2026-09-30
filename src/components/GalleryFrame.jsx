// GalleryFrame.jsx — A floating 3D photo frame orbiting a planet

import React, { useRef, useState, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Image } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

class ImageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Image load error:", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

const ORBIT_RADIUS_X = 2.6;
const ORBIT_RADIUS_Z = 2.6;
const BOB_AMPLITUDE = 0.06;

export default function GalleryFrame({ memory, index, total, viewed, onClick, visible = true }) {
  const groupRef = useRef();
  const frameRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Evenly space frames around the orbit
  const baseAngle = (index / total) * Math.PI * 2;

  // Animate in and out based on visible prop
  useEffect(() => {
    if (!groupRef.current) return;
    if (visible) {
      gsap.to(groupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.0,
        delay: index * 0.1,
        ease: "back.out(1.2)",
      });
    } else {
      gsap.to(groupRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.6,
        ease: "power2.in",
      });
    }
  }, [visible, index]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    
    // Slow, elegant orbit
    const angle = baseAngle + t * 0.15;
    groupRef.current.position.x = Math.cos(angle) * ORBIT_RADIUS_X;
    groupRef.current.position.z = Math.sin(angle) * ORBIT_RADIUS_Z;
    
    // Gentle bob
    groupRef.current.position.y = Math.sin(t * 0.4 + baseAngle) * BOB_AMPLITUDE;
    
    // Face the camera directly for readability
    groupRef.current.rotation.y = -angle + Math.PI * 0.5;

    // Hover scale
    if (frameRef.current) {
      const targetScale = hovered ? 1.15 : 1;
      frameRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.08
      );
    }
  });

  // Handle pointer cursor globally
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  return (
    <group ref={groupRef}>
      <group 
        ref={frameRef} 
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {/* Invisible 3D hit box to make clicking much more responsive from ANY angle */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 1.8, 0.4]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Soft elegant glass frame backplate (reverted from heavy transmission material to fix lighting bugs) */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.7, 0.9]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
        


        {/* Sleek thin border */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.72, 0.92]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={hovered ? 0.4 : 0.1} 
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* The Photo or Add Button */}
        {memory.isAddButton ? (
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.66, 0.86]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        ) : (!memory.photos?.length && !memory.photoUrl) ? (
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.66, 0.86]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <ImageErrorBoundary fallback={
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[0.66, 0.86]} />
              <meshBasicMaterial color="#ff5555" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
          }>
            <Suspense fallback={
              <mesh position={[0, 0, 0.01]}>
                <planeGeometry args={[0.66, 0.86]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
              </mesh>
            }>
              <Image 
                url={(memory.photos?.[0] || memory.photoUrl) + "?webgl=true"} 
                position={[0, 0, 0.01]} 
                scale={[0.66, 0.86]} 
                color={hovered ? "#888888" : "#ffffff"}
                transparent 
                side={THREE.DoubleSide}
              />
            </Suspense>
          </ImageErrorBoundary>
        )}

        {/* Floating text via Html (transform=false so it renders sharply on top, but occluded perfectly) */}
        <Html
          center
          position={[0, 0, 0.22]} // Moved forward to avoid being occluded by the invisible 3D hitbox
          transform
          occlude
          distanceFactor={5}
          style={{ pointerEvents: "none" }}
        >
          {memory.isAddButton ? (
            <div style={{ fontSize: "50px", color: "rgba(255,255,255,0.9)", fontWeight: 300, transform: hovered ? "scale(1.2)" : "scale(1)", transition: "all 0.3s", textShadow: "0 0 10px rgba(255,255,255,0.5)" }}>+</div>
          ) : (!memory.photos?.length && !memory.photoUrl) && (
            <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.9)", fontWeight: 400, textAlign: "center", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
              {memory.title || "Empty Memory"}
            </div>
          )}
          
          <div style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s",
            color: "white",
            fontSize: "11px",
            letterSpacing: "0.2em",
            fontWeight: "bold",
            textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
            textAlign: "center",
            textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }}>
            {memory.isAddButton ? "Create\nMemory" : (!memory.photos?.length && !memory.photoUrl) ? "Upload\nPhotos" : "View"}
          </div>
        </Html>

        {/* Viewed checkmark (subtle elegant dot) */}
        {viewed && !memory.isAddButton && (
          <mesh position={[0.3, 0.4, 0.03]}>
            <circleGeometry args={[0.04, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>
        )}
      </group>
    </group>
  );
}
