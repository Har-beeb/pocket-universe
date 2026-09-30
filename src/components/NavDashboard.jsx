import { SCENE } from "../App";

export default function NavDashboard({
  scene,
  chapters,
  selectedChapter,
  onPlanetClick,
}) {
  const inGalaxy = scene === SCENE.GALAXY;
  const inPlanet = scene === SCENE.PLANET;

  return (
    <>
      <style>{`
        .nav-dock {
          background: rgba(10, 14, 28, 0.4);
          backdrop-filter: blur(24px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          padding: 16px 48px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .nav-text {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }
        @media (max-width: 768px) {
          .nav-dock {
            padding: 16px 24px;
            border-radius: 32px;
            width: calc(100% - 32px);
            max-width: 400px;
            justify-content: space-around;
            gap: 8px;
          }
          .nav-text {
            font-size: 9px;
            letter-spacing: 0.1em;
          }
          .nav-line {
            display: none !important; /* Hide connecting lines on mobile to save space */
          }
          .nav-item {
            flex-direction: column;
            gap: 6px;
            text-align: center;
          }
        }
      `}</style>
      
      {/* ── BOTTOM NAVIGATION BAR ── */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center pointer-events-none"
        style={{ 
          zIndex: 2147483647,
          bottom: "48px", 
          opacity: (inGalaxy || inPlanet) ? 1 : 0, 
          transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: (inGalaxy || inPlanet) ? "translateY(0)" : "translateY(20px)"
        }}
      >
        {inGalaxy && (
          <div className="mb-6 text-white/40 text-[10px] tracking-[0.4em] uppercase font-light">
            Select a timeline
          </div>
        )}

        {/* ── CONSTELLATION TIMELINE ── */}
        <div className="nav-dock flex items-center justify-center gap-0 pointer-events-auto">
          {chapters.map((ch, i) => {
            const isSelected = selectedChapter?.id === ch.id;
            const isPast = chapters.findIndex((c) => c.id === selectedChapter?.id) >= i;

            return (
              <div key={ch.id} style={{ display: "flex", alignItems: "center" }}>
                {/* Node */}
                <button
                  onClick={() => !ch.locked && onPlanetClick(ch)}
                  className="nav-item group relative"
                  style={{ 
                    cursor: ch.locked ? "not-allowed" : "pointer",
                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                  }}
                >
                  <div
                    style={{
                      width: isSelected ? "14px" : "12px",
                      height: isSelected ? "14px" : "12px",
                      borderRadius: "50%",
                      border: isSelected ? "3px solid #fff" : "1px solid rgba(255,255,255,0.3)",
                      background: ch.locked
                        ? "transparent"
                        : isSelected
                        ? "white"
                        : "rgba(255,255,255,0.1)",
                      boxShadow: isSelected ? "0 0 20px rgba(255,255,255,0.4)" : "none",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                  <span
                    className="nav-text"
                    style={{
                      color: ch.locked ? "rgba(255,255,255,0.2)" : isSelected ? "#fff" : "rgba(255,255,255,0.5)",
                      transition: "color 0.4s ease"
                    }}
                  >
                    {ch.name}
                  </span>
                  
                  {/* Tooltip for locked planets */}
                  {ch.locked && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/90 text-white/80 text-[10px] tracking-[0.2em] uppercase px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap backdrop-blur-md">
                      Coming in {ch.year}
                    </div>
                  )}
                </button>

                {/* Connecting Line (except last item) */}
                {i < chapters.length - 1 && (
                  <div
                    className="nav-line"
                    style={{
                      width: "60px",
                      height: "1px",
                      background: isPast
                        ? "linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1))"
                        : "rgba(255, 255, 255, 0.1)",
                      margin: "0 16px",
                      transition: "background 0.8s ease",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
