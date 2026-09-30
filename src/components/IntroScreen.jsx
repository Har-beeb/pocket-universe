import { useEffect, useState } from "react";
import { HER_NAME } from "../data/chapters";

const LINES = [
  "Somewhere in the universe,",
  "a star was made just for you.",
];

export default function IntroScreen({ onEnter }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [showName, setShowName] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setLineIndex(1), 500);
    const t2 = setTimeout(() => setLineIndex(2), 1500);
    const t3 = setTimeout(() => setShowName(true), 2500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  // Artificial smooth loading progress
  useEffect(() => {
    if (showName && progress < 100) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + Math.floor(Math.random() * 15) + 5;
          return next > 100 ? 100 : next;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [showName, progress]);

  // Show button exactly when it hits 100%
  useEffect(() => {
    if (progress === 100) {
      const t4 = setTimeout(() => setShowButton(true), 500);
      return () => clearTimeout(t4);
    }
  }, [progress]);

  const handleEnter = () => {
    setClicked(true);
    setFadeOut(true);
    setTimeout(onEnter, 1000);
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{
        pointerEvents: "auto",
        background: "radial-gradient(ellipse at center, #0a0e1c 0%, #000000 100%)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 1s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              "--base-opacity": p.opacity,
              animation: `twinkle ${p.duration}s ease-in-out infinite alternate`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center px-8 max-w-2xl">
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "clamp(16px, 2.5vw, 22px)",
            color: "rgba(200, 220, 255, 0.8)",
            letterSpacing: "0.05em",
            textShadow: "0 0 20px rgba(160, 200, 255, 0.4)",
            opacity: lineIndex >= 1 ? 1 : 0,
            transform: lineIndex >= 1 ? "translateY(0)" : "translateY(16px)",
            transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            marginBottom: "12px",
          }}
        >
          {LINES[0]}
        </p>

        <p
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "clamp(16px, 2.5vw, 22px)",
            color: "rgba(200, 220, 255, 0.8)",
            letterSpacing: "0.05em",
            textShadow: "0 0 20px rgba(160, 200, 255, 0.4)",
            opacity: lineIndex >= 2 ? 1 : 0,
            transform: lineIndex >= 2 ? "translateY(0)" : "translateY(16px)",
            transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            marginBottom: "56px",
          }}
        >
          {LINES[1]}
        </p>

        <div
          style={{
            position: "relative",
            display: "inline-block",
            opacity: showName ? 1 : 0,
            transform: showName ? "scale(1)" : "scale(0.95)",
            transition: "all 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
            marginBottom: "64px",
          }}
        >
          {/* Magical sparkles sprinkled around the name */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 0 10px 2px rgba(160, 200, 255, 0.8)",
                left: `${15 + Math.random() * 70}%`,
                top: `${-20 + Math.random() * 140}%`,
                animation: `sparkleFloat ${2 + Math.random() * 2}s ease-in-out infinite alternate`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0,
              }}
            />
          ))}
          
          {/* Base Text */}
          <h1
            style={{
              position: "relative",
              zIndex: 2,
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(48px, 8vw, 84px)",
              color: "#d4e8ff",
              letterSpacing: "0.08em",
              lineHeight: 1.1,
              animation: "breatheScale 4s ease-in-out infinite alternate",
            }}
          >
            {HER_NAME}
          </h1>
          
          {/* Glowing Aura (Smoothly animates opacity instead of text-shadow) */}
          <h1
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(48px, 8vw, 84px)",
              color: "#d4e8ff",
              letterSpacing: "0.08em",
              lineHeight: 1.1,
              filter: "blur(12px)",
              opacity: 0,
              animation: "breatheGlow 4s ease-in-out infinite alternate",
            }}
          >
            {HER_NAME}
          </h1>
        </div>

        {showName && !showButton && progress < 100 && (
          <div className="text-white/50 text-[10px] tracking-[0.3em] uppercase mt-8 animate-pulse">
            Loading Universe {Math.round(progress)}%
          </div>
        )}

        <button
          onClick={handleEnter}
          className={`intro-btn ${showButton ? 'visible' : ''} ${clicked ? 'clicked' : ''}`}
          style={{ display: showButton || clicked ? 'inline-block' : 'none' }}
        >
          {clicked ? "Entering..." : "Enter Your Universe →"}
        </button>
      </div>

      <style>{`
        .intro-btn {
          opacity: 0;
          transform: translateY(16px);
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(220, 235, 255, 0.9);
          background: transparent;
          border: 1px solid rgba(100, 150, 220, 0.4);
          padding: 16px 48px;
          cursor: pointer;
          border-radius: 100px;
          backdrop-filter: blur(12px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 20px rgba(100, 160, 255, 0.1);
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .intro-btn.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .intro-btn.clicked {
          transform: scale(0.9) !important;
          background: rgba(255, 255, 255, 0.9) !important;
          color: #000 !important;
          box-shadow: 0 0 50px rgba(160, 200, 255, 0.8) !important;
        }
        @media (hover: hover) {
          .intro-btn:hover {
            color: #fff;
            background: rgba(40, 80, 160, 0.2);
            border-color: rgba(140, 180, 255, 0.8);
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(100, 160, 255, 0.4);
          }
        }
        .intro-btn:active {
          transform: scale(0.95);
          background: rgba(140, 180, 255, 0.3);
          transition: all 0.1s;
        }

        @keyframes twinkle {
          from { opacity: var(--base-opacity, 0.1); }
          to   { opacity: calc(var(--base-opacity, 0.1) * 4); }
        }
        @keyframes breatheScale {
          from { transform: scale(1); }
          to   { transform: scale(1.02); }
        }
        @keyframes breatheGlow {
          from { opacity: 0.3; transform: scale(1); filter: blur(8px); }
          to   { opacity: 1; transform: scale(1.05); filter: blur(16px); }
        }
        @keyframes sparkleFloat {
          0%   { opacity: 0; transform: translateY(0) scale(0.5); }
          50%  { opacity: 1; transform: translateY(-10px) scale(1); }
          100% { opacity: 0; transform: translateY(-20px) scale(0.5); }
        }
      `}</style>
    </div>
  );
}

const particles = Array.from({ length: 120 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  opacity: Math.random() * 0.3 + 0.05,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 4,
}));
