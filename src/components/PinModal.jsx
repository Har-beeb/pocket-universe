import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

// Global references for the imperative API
let resolvePromise = null;
let containerElement = null;
let root = null;

function PinModalComponent({ message, onClose }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const partnerName = import.meta.env.VITE_PARTNER_NAME || "My Love";
  const displayMessage = message || `This action is locked. Prove you're ${partnerName}.`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === import.meta.env.VITE_SECRET_PIN) {
      localStorage.setItem("universe_admin", "true");
      onClose(true); // Success
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000); // Reset error shake
      setPin("");
    }
  };

  return (
    <div className="pin-overlay" onClick={() => onClose(false)}>
      <div className={`pin-card ${error ? 'shake' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="pin-icon">🔒</div>
        <h2 className="pin-title">Admin Access Required</h2>
        <p className="pin-message">{displayMessage}</p>
        
        <form onSubmit={handleSubmit} className="pin-form">
          <input
            type="password"
            autoFocus
            className={`pin-input ${error ? 'error' : ''}`}
            placeholder="Enter secret PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <div className="pin-buttons">
            <button type="button" className="pin-btn-cancel" onClick={() => onClose(false)}>Cancel</button>
            <button type="submit" className="pin-btn-submit" disabled={pin.length === 0}>Unlock</button>
          </div>
        </form>
      </div>

      <style>{`
        .pin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          z-index: 2147483647;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pinFadeIn 0.3s ease;
        }
        .pin-card {
          background: #0f111a;
          border: 1px solid rgba(140, 168, 255, 0.3);
          border-radius: 16px;
          padding: 32px;
          width: 90%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .pin-icon {
          font-size: 32px;
          margin-bottom: 16px;
        }
        .pin-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: #fff;
          margin-bottom: 8px;
        }
        .pin-message {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 24px;
        }
        .pin-input {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 12px;
          color: #fff;
          text-align: center;
          font-size: 24px;
          letter-spacing: 0.5em;
          margin-bottom: 24px;
          transition: border-color 0.3s;
        }
        .pin-input:focus {
          outline: none;
          border-color: #8ca8ff;
        }
        .pin-input.error {
          border-color: #ff4e50;
          color: #ff4e50;
        }
        .pin-buttons {
          display: flex;
          gap: 12px;
        }
        .pin-btn-cancel, .pin-btn-submit {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
        }
        .pin-btn-cancel {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.7);
        }
        .pin-btn-cancel:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .pin-btn-submit {
          background: rgba(140, 168, 255, 0.15);
          border: 1px solid rgba(140, 168, 255, 0.4);
          color: #8ca8ff;
        }
        .pin-btn-submit:not(:disabled):hover {
          background: rgba(140, 168, 255, 0.3);
          color: #fff;
        }
        .pin-btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @keyframes pinFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(4px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-8px, 0, 0); }
          40%, 60% { transform: translate3d(8px, 0, 0); }
        }
      `}</style>
    </div>
  );
}

// Imperative API to show the modal and wait for result
export function promptForPin(message) {
  if (localStorage.getItem("universe_admin") === "true") {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    if (containerElement) return; // Prevent double trigger
    
    containerElement = document.createElement("div");
    document.body.appendChild(containerElement);
    root = createRoot(containerElement);

    const cleanup = (result) => {
      root.unmount();
      if (containerElement.parentNode) {
        containerElement.parentNode.removeChild(containerElement);
      }
      containerElement = null;
      resolve(result);
    };

    root.render(<PinModalComponent message={message} onClose={cleanup} />);
  });
}
