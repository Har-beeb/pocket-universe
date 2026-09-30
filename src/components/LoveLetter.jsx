// LoveLetter.jsx — Secret finale letter reveal

import { useEffect, useState } from "react";
import { LOVE_LETTER } from "../data/chapters";

export default function LoveLetter({ onClose }) {
  const [visible, setVisible] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const lines = LOVE_LETTER.split("\n");

  useEffect(() => {
    // Fade in background
    const t = setTimeout(() => setVisible(true), 50);
    // Show close button after letter has had time to reveal (e.g. 10 seconds)
    const t2 = setTimeout(() => setShowClose(true), 12000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 1000);
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-8 overflow-y-auto"
      style={{
        pointerEvents: "auto",
        background: "radial-gradient(ellipse at center, #060412 0%, #000000 100%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 1s ease",
      }}
    >
      {/* Subtle starlight background */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
           style={{ background: "url('https://www.transparenttextures.com/patterns/stardust.png')" }} />

      <div
        className="relative max-w-2xl w-full text-center py-16"
        style={{
          fontFamily: "'Playfair Display', serif",
          color: "#e8f0ff",
        }}
      >
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              lineHeight: "1.8",
              marginBottom: line.trim() === "" ? "1.5rem" : "0.5rem",
              opacity: 0,
              transform: "translateY(10px)",
              animation: `fadeInUp 1.5s ease forwards`,
              animationDelay: `${1.5 + i * 0.4}s`,
              textShadow: "0 0 12px rgba(160, 196, 255, 0.4)",
            }}
          >
            {line}
          </p>
        ))}

        {/* Close Button */}
        <div
          style={{
            marginTop: "60px",
            opacity: showClose ? 1 : 0,
            transition: "opacity 2s ease",
          }}
        >
          <button
            onClick={handleClose}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(140, 170, 220, 0.5)",
              background: "transparent",
              border: "1px solid rgba(140, 170, 220, 0.3)",
              padding: "12px 24px",
              cursor: "pointer",
              borderRadius: "2px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "rgba(180, 210, 255, 0.9)";
              e.target.style.borderColor = "rgba(140, 170, 220, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "rgba(140, 170, 220, 0.5)";
              e.target.style.borderColor = "rgba(140, 170, 220, 0.3)";
            }}
          >
            Return to the Stars
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
