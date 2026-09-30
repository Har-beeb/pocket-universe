// GalaxyScene.jsx — Clean, centred 3D scene with correct VR parallax

import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import gsap from "gsap";
import * as THREE from "three";

import Planet from "./Planet";
import LockedPlanet from "./LockedPlanet";
import GalleryFrame from "./GalleryFrame";
import NebulaBackground from "./NebulaBackground";
import SpiralGalaxy from "./SpiralGalaxy";
import ShootingStars from "./ShootingStars";
import { SCENE } from "../App";

// Camera resting position in galaxy view — y=0 for perfect vertical centre
const GALAXY_CAM = new THREE.Vector3(0, 0, 12);
// Offset from planet origin when zoomed in
const PLANET_OFFSET = new THREE.Vector3(0, 0, 5.5);

export default function GalaxyScene({
  scene,
  chapters,
  selectedChapter,
  viewedMemories,
  onPlanetClick,
  onMemoryClick,
}) {
  const { camera, pointer, size } = useThree();
  // Parallax group — subtly rotates with the mouse to create immersive depth
  const parallaxRef = useRef();
  const isMobile = size.width < 768;
  const isWarping = useRef(false);

  // Set camera to look straight at origin ONLY on mount
  useEffect(() => {
    camera.position.copy(GALAXY_CAM);
    if (isMobile) camera.position.z = 22;
    camera.lookAt(0, 0, 0);
    camera.rotation.set(0, 0, 0);
    camera.fov = 45;
    camera.updateProjectionMatrix();
  }, [camera, isMobile]);

  // Handle warp drive pointer events (depends on scene)
  useEffect(() => {
    let warpTimeout;
    const handleDown = (e) => { 
      if (e.target.tagName.toLowerCase() !== 'canvas') return;
      if (scene === SCENE.GALAXY) {
        warpTimeout = setTimeout(() => { isWarping.current = true; }, 150);
      }
    };
    const handleUp = () => { 
      clearTimeout(warpTimeout);
      isWarping.current = false; 
    };
    
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [scene]);

  // GSAP camera flights
  useEffect(() => {
    if (scene === SCENE.PLANET && selectedChapter) {
      // Zoom into planet
      const p = selectedChapter.position;
      const targetPos = new THREE.Vector3(p[0], p[1], p[2]).add(PLANET_OFFSET);
      if (isMobile) targetPos.z += 4.5; // Back up on mobile when viewing a planet

      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 2.2,
        ease: "power3.inOut",
      });
    } else if (scene === SCENE.GALAXY) {
      // Zoom out to galaxy
      const targetPos = GALAXY_CAM.clone();
      if (isMobile) targetPos.z = 22;

      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 2.2,
        ease: "power3.inOut",
      });
    }
  }, [scene, selectedChapter, camera, isMobile]);

  useFrame(() => {
    // Warp Drive FOV and chromatic aberration simulation
    const targetFov = isWarping.current ? 90 : 45;
    if (Math.abs(camera.fov - targetFov) > 0.1) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.05);
      camera.updateProjectionMatrix();
    }

    if (!parallaxRef.current) return;
    
    // Natural VR parallax — scene tilts toward where you look, very gently.
    // We disable this when zoomed into a planet so it stays perfectly centered!
    const targetY = scene === SCENE.GALAXY ? pointer.x * 0.12 : 0;
    const targetX = scene === SCENE.GALAXY ? -pointer.y * 0.08 : 0;

    parallaxRef.current.rotation.y = THREE.MathUtils.lerp(
      parallaxRef.current.rotation.y, targetY, 0.04
    );
    parallaxRef.current.rotation.x = THREE.MathUtils.lerp(
      parallaxRef.current.rotation.x, targetX, 0.04
    );
  });

  return (
    <>
      {/* ── CINEMATIC BLOOM POST-PROCESSING ── */}
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom
          luminanceThreshold={0.18}
          mipmapBlur
          intensity={isMobile ? 1.5 : 2.2}
          radius={0.9}
        />
      </EffectComposer>

      {/* ── LIGHTING ── */}
      {/* Key light — from upper right, blue-white, simulates distant star */}
      <directionalLight position={[8, 5, 5]} intensity={2.5} color="#c8dcff" />
      {/* Fill light — purple from opposite side, space ambience */}
      <pointLight position={[-8, -4, -6]} intensity={3} color="#7722cc" decay={0.4} />
      {/* Subtle warm core light */}
      <pointLight position={[0, 0, 8]} intensity={1.0} color="#ffcc88" decay={1} />
      <ambientLight intensity={0.07} color="#080820" />

      {/* ── BACKGROUND STARS (drawn at camera position, always visible) ── */}
      <Stars radius={180} depth={80} count={5000} factor={6} fade speed={1.5} />
      <Stars radius={60} depth={40} count={1500} factor={3} fade speed={1.0} />
      <NebulaBackground />

      {/* ── PARALLAX UNIVERSE GROUP ── */}
      {/* Parallax universe group — subtly tilts with mouse */}
      <group ref={parallaxRef}>
        {/* Shooting stars flying across the background */}
        <ShootingStars />

        {/* Massive spiral galaxy in the deep background */}
        <SpiralGalaxy />

        {/* Chapter planets */}
        {chapters.map((chapter) => (
          <Planet
            key={chapter.id}
            chapter={chapter}
            isSelected={selectedChapter?.id === chapter.id}
            scene={scene}
            onClick={() => !chapter.locked && onPlanetClick(chapter)}
          />
        ))}

        {/* Gallery frames orbit the selected planet */}
        {selectedChapter && (
          <group position={selectedChapter.position}>
            {[...selectedChapter.memories, { id: "add-new", isAddButton: true }].map((memory, i, arr) => (
              <GalleryFrame
                key={memory.id}
                memory={memory}
                index={i}
                total={arr.length}
                viewed={viewedMemories.has(memory.id)}
                onClick={() => onMemoryClick(memory)}
                visible={scene === SCENE.PLANET}
              />
            ))}
          </group>
        )}
      </group>
    </>
  );
}
