import { createContext, useContext, useState, useRef, useEffect } from "react";

const AudioContext = createContext();

const AMBIENT_TRACK = "/ambient.mp3";

export function AudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null); // null means play ambient
  
  const audioRef = useRef(null);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.4;
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Handle track switching
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    
    const targetSrc = currentTrack || AMBIENT_TRACK;

    // Only switch if it's actually a different track
    if (audio.src !== targetSrc) {
      audio.src = targetSrc;
      audio.load();
      if (isPlaying) {
        audio.play().catch(e => console.warn("Audio autoplay blocked during switch", e));
      }
    }
  }, [currentTrack, isPlaying]);

  const toggleSound = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.warn("Audio playback prevented:", e);
          alert("Your browser blocked the audio. Please interact with the page first.");
        });
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, toggleSound, currentTrack, setCurrentTrack }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
