import React, { useEffect, useState } from "react";

export default function Balloons({ show, onComplete }) {
  const [balloons, setBalloons] = useState([]);

  useEffect(() => {
    if (show) {
      // Generate 15 random balloons
      const newBalloons = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: Math.random() * 90 + 5, // 5% to 95%
        delay: Math.random() * 2, // 0 to 2s delay
        color: ["#ff4e50", "#f9d423", "#e1bee7", "#8ca8ff", "#ff8844"][Math.floor(Math.random() * 5)],
        scale: 0.8 + Math.random() * 0.4,
      }));
      setBalloons(newBalloons);

      // Unmount after 8 seconds
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setBalloons([]);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="balloons-container">
      {balloons.map((b) => (
        <div
          key={b.id}
          className="balloon-wrapper"
          style={{
            left: `${b.left}%`,
            animationDelay: `${b.delay}s`,
            transform: `scale(${b.scale})`,
          }}
        >
          <div className="balloon" style={{ backgroundColor: b.color }}>
            <div className="balloon-reflection"></div>
          </div>
          <div className="balloon-string"></div>
        </div>
      ))}
      <style>{`
        .balloons-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 2147483647;
          overflow: hidden;
        }

        .balloon-wrapper {
          position: absolute;
          bottom: -150px;
          animation: floatUp 6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .balloon {
          width: 60px;
          height: 75px;
          background: #ff4e50;
          border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
          position: relative;
          box-shadow: inset -5px -5px 15px rgba(0, 0, 0, 0.2);
        }

        .balloon::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 10px;
          background: inherit;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }

        .balloon-reflection {
          position: absolute;
          top: 10px;
          left: 10px;
          width: 15px;
          height: 30px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          transform: rotate(20deg);
        }

        .balloon-string {
          width: 2px;
          height: 80px;
          background: rgba(255, 255, 255, 0.3);
          margin-top: 2px;
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-60vh) rotate(5deg);
          }
          100% {
            transform: translateY(-120vh) rotate(-5deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
