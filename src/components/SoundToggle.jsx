import { useAudio } from "../context/AudioContext";

export default function SoundToggle() {
  const { isPlaying, toggleSound } = useAudio();

  return (
    <>
      <button
        className="sound-toggle-btn"
        onClick={toggleSound}
        title={isPlaying ? "Mute ambient sound" : "Play ambient sound"}
        style={{
          borderColor: isPlaying ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)",
          color: isPlaying ? "#fff" : "rgba(255,255,255,0.4)",
          boxShadow: isPlaying ? "0 0 30px rgba(160,200,255,0.2)" : "none",
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; 
          e.currentTarget.style.color = "#fff"; 
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.borderColor = isPlaying ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"; 
          e.currentTarget.style.color = isPlaying ? "#fff" : "rgba(255,255,255,0.4)"; 
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>

      <style>{`
        .sound-toggle-btn {
          position: absolute;
          top: 24px;
          right: 40px;
          z-index: 2147483647;
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(10,14,28,0.4);
          backdrop-filter: blur(16px);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 800px) {
          .sound-toggle-btn {
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </>
  );
}
