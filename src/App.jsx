import { useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { chapters as baseChapters } from "./data/chapters";

import IntroScreen from "./components/IntroScreen";
import GalaxyScene from "./components/GalaxyScene";
import MemoryCard from "./components/MemoryCard";
import LoveLetter from "./components/LoveLetter";
import SoundToggle from "./components/SoundToggle";
import NavDashboard from "./components/NavDashboard";

import UploadModal from "./components/UploadModal";
import Balloons from "./components/Balloons";
import BirthdayMessage from "./components/BirthdayMessage";
import confetti from "canvas-confetti";
import { useAudio } from "./context/AudioContext";

// Scene states
export const SCENE = {
  INTRO: "intro",
  GALAXY: "galaxy",
  PLANET: "planet",
  MEMORY: "memory",
  LETTER: "letter",
};

export default function App() {
  const [scene, setScene] = useState(SCENE.INTRO);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [viewedMemories, setViewedMemories] = useState(new Set());
  
  const [chapters, setChapters] = useState(baseChapters);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showBirthdayMessage, setShowBirthdayMessage] = useState(false);
  const { setCurrentTrack } = useAudio();

  // Smart Audio Engine Hook
  useEffect(() => {
    if (scene === SCENE.MEMORY && selectedMemory && selectedMemory.audioUrl) {
      setCurrentTrack(selectedMemory.audioUrl);
    } else if (scene === SCENE.GALAXY || scene === SCENE.PLANET || scene === SCENE.LETTER) {
      setCurrentTrack(null); // Reverts back to ambient space track
    }
  }, [scene, selectedMemory, setCurrentTrack]);

  useEffect(() => {
    const q = query(collection(db, "memories"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMemories = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Group memories by chapterId
      const hydrated = baseChapters.map((ch) => {
        return {
          ...ch,
          memories: allMemories.filter((m) => m.chapterId === ch.id),
        };
      });
      setChapters(hydrated);

      // If a chapter is currently selected, update its reference so the scene re-renders the new memories
      setSelectedChapter((prevSelected) => {
        if (!prevSelected) return null;
        return hydrated.find((c) => c.id === prevSelected.id) || prevSelected;
      });
      
      // If a memory is currently open, update its reference so it updates instantly
      setSelectedMemory((prevSelected) => {
        if (!prevSelected) return null;
        return allMemories.find((m) => m.id === prevSelected.id) || prevSelected;
      });
    });

    return () => unsubscribe();
  }, []);

  const enterGalaxy = useCallback(() => setScene(SCENE.GALAXY), []);

  const enterPlanet = useCallback((chapter) => {
    setSelectedChapter(chapter);
    setScene(SCENE.PLANET);

    const isBirthday = new Date().getMonth() === 8 && new Date().getDate() === 30; // Sept 30

    if (chapter.id === "the_present" && isBirthday) {
      setShowCelebration(true);
      setShowBirthdayMessage(true);
      
      const duration = 5000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 6,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          zIndex: 2147483647,
          colors: ['#ff4e50', '#f9d423', '#8ca8ff', '#ffffff']
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          zIndex: 2147483647,
          colors: ['#ff4e50', '#f9d423', '#8ca8ff', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, []);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const openMemory = useCallback(
    (memory) => {
      if (memory.isAddButton) {
        import("./components/PinModal").then(({ promptForPin }) => {
          promptForPin().then(success => {
            if (success) setIsUploadModalOpen(true);
          });
        });
        return;
      }
      setSelectedMemory(memory);
      setScene(SCENE.MEMORY);
      setViewedMemories((prev) => new Set([...prev, memory.id]));
    },
    []
  );

  const closeMemory = useCallback(() => {
    setSelectedMemory(null);
    setScene(SCENE.PLANET);
  }, []);

  const backToGalaxy = useCallback(() => {
    setScene(SCENE.GALAXY);
    // Let the camera zoom out while frames animate out naturally,
    // then clear the selected chapter after animation completes
    setTimeout(() => {
      setSelectedChapter(null);
    }, 1500);
  }, []);

  const backToIntro = useCallback(() => {
    setScene(SCENE.INTRO);
  }, []);

  const openLetter = useCallback(() => setScene(SCENE.LETTER), []);
  const closeLetter = useCallback(() => setScene(SCENE.PLANET), []);

  // Has she viewed all memories in the current chapter?
  const allMemoriesViewed =
    selectedChapter &&
    selectedChapter.memories.length > 0 &&
    selectedChapter.memories.every((m) => viewedMemories.has(m.id));

  return (
    <div className="relative w-full h-full bg-black">
      {/* ── 3D Canvas (always mounted, controls visibility via opacity) ── */}
      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 0, 12], fov: 55 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 2]} // Safe static dpr bounds
      >
        <GalaxyScene
          scene={scene}
          chapters={chapters}
          selectedChapter={selectedChapter}
          viewedMemories={viewedMemories}
          onPlanetClick={enterPlanet}
          onMemoryClick={openMemory}
        />
      </Canvas>

      {/* ── 2D UI Overlays (Guaranteed to be above 3D Canvas) ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2147483647 }}>
        
        {/* Intro Screen */}
        {scene === SCENE.INTRO && <IntroScreen onEnter={enterGalaxy} />}

        {/* Memory Card Modal */}
        {scene === SCENE.MEMORY && selectedMemory && (
          <MemoryCard memory={selectedMemory} onClose={closeMemory} />
        )}

        {/* Back and Return Buttons */}
        {(scene === SCENE.PLANET || scene === SCENE.GALAXY) && (
          <>
            {scene === SCENE.PLANET && (
              <div className="absolute top-6 left-6 pointer-events-auto h-10 flex items-center">
                <button
                  onClick={backToGalaxy}
                  className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors text-sm tracking-widest uppercase font-light"
                >
                  <span>←</span>
                  <span>Back to Stars</span>
                </button>
              </div>
            )}

            {scene === SCENE.GALAXY && (
              <div className="absolute top-6 left-6 pointer-events-auto h-10 flex items-center">
                <button
                  onClick={backToIntro}
                  className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-xs tracking-widest uppercase font-light"
                >
                  <span>←</span>
                  <span>Return to Beginning</span>
                </button>
              </div>
            )}

            {scene === SCENE.PLANET && allMemoriesViewed && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto">
                <button
                  onClick={openLetter}
                  className="animate-pulse text-amber-300/80 hover:text-amber-200 transition-colors text-sm tracking-widest uppercase font-light border border-amber-300/30 hover:border-amber-300/60 px-6 py-3 rounded-full backdrop-blur-sm"
                >
                  ✦ There is one more thing...
                </button>
              </div>
            )}
          </>
        )}

        {/* Love Letter */}
        {scene === SCENE.LETTER && <LoveLetter onClose={closeLetter} />}

        {/* Navigation dashboard */}
        {(scene === SCENE.GALAXY || scene === SCENE.PLANET) && (
          <NavDashboard
            scene={scene}
            chapters={chapters}
            selectedChapter={selectedChapter}
            viewedMemories={viewedMemories}
            onPlanetClick={enterPlanet}
            onBackToGalaxy={backToGalaxy}
          />
        )}

        {/* Sound toggle */}
        {scene !== SCENE.INTRO && scene !== SCENE.LETTER && <SoundToggle />}

        {/* Upload Modal */}
        {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} selectedChapter={selectedChapter} />}
        
        {/* Celebration Effects */}
        <Balloons show={showCelebration} onComplete={() => setShowCelebration(false)} />
        <BirthdayMessage show={showBirthdayMessage} onClose={() => setShowBirthdayMessage(false)} />
      </div>
    </div>
  );
}
