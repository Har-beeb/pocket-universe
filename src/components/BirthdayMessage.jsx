import React, { useEffect, useState } from "react";

export default function BirthdayMessage({ show, onClose }) {
  const [visible, setVisible] = useState(false);
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (show) {
      setRender(true);
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      setTimeout(() => setRender(false), 500);
    }
  }, [show]);

  if (!render) return null;

  return (
    <div className={`bm-overlay ${visible ? 'visible' : ''}`} onClick={onClose}>
      <div className="bm-card" onClick={(e) => e.stopPropagation()}>
        <div className="bm-decor-top"></div>
        
        <h1 className="bm-title">Happy Birthday, {import.meta.env.VITE_PARTNER_NAME || "My Love"}</h1>
        
        <p className="bm-prayer">
          I pray Allah keeps you, protects you, and grants you everything your beautiful heart desires. 
          May this year and the coming years be softer and kinder to you, lots of love, Happy birthday.
        </p>

        <button className="bm-continue" onClick={onClose}>
          Enter The Present
        </button>
        
        <div className="bm-decor-bottom"></div>
      </div>

      <style>{`
        .bm-overlay {
          position: fixed;
          inset: 0;
          z-index: 2147483648; /* Highest, above balloons */
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: auto;
        }
        .bm-overlay.visible {
          opacity: 1;
        }
        .bm-card {
          background: linear-gradient(145deg, #111424, #0a0c16);
          border: 1px solid rgba(140, 168, 255, 0.3);
          border-radius: 20px;
          padding: 40px 30px;
          max-width: 480px;
          width: 90%;
          text-align: center;
          box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(140, 168, 255, 0.15);
          position: relative;
          transform: translateY(20px) scale(0.95);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bm-overlay.visible .bm-card {
          transform: translateY(0) scale(1);
        }
        
        .bm-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          color: #ffcc88;
          margin-bottom: 24px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        
        .bm-prayer {
          font-family: 'Lora', serif;
          font-size: 16px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 32px;
          font-style: italic;
        }
        
        .bm-continue {
          background: rgba(140, 168, 255, 0.15);
          color: #8ca8ff;
          border: 1px solid rgba(140, 168, 255, 0.4);
          border-radius: 30px;
          padding: 14px 32px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .bm-continue:hover {
          background: rgba(140, 168, 255, 0.25);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }

        .bm-decor-top, .bm-decor-bottom {
          position: absolute;
          width: 60px;
          height: 2px;
          background: #ffcc88;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0.5;
        }
        .bm-decor-top { top: 20px; }
        .bm-decor-bottom { bottom: 20px; }
        
        @media (max-width: 600px) {
          .bm-title { font-size: 26px; }
          .bm-prayer { font-size: 15px; }
          .bm-card { padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
}
