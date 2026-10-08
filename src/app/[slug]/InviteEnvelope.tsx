"use client";

import { useState, useEffect } from "react";

interface Props {
  envelopeColor: string;
  sealColor: string;
  monogramUrl: string | null;
  name1: string;
  name2: string;
}

type Phase = "idle" | "breaking" | "opening" | "revealing" | "done";

export function InviteEnvelope({ envelopeColor, sealColor, monogramUrl, name1, name2 }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function handleSealClick() {
    if (phase !== "idle") return;
    setPhase("breaking");
    setTimeout(() => setPhase("opening"), 600);
    setTimeout(() => setPhase("revealing"), 1600);
    setTimeout(() => setPhase("done"), 2400);
  }

  if (!mounted || phase === "done") return null;

  const initials = `${name1[0] ?? ""}${name2[0] ?? ""}`.toUpperCase();

  // Lighten/darken envelope color for flap shading
  const isOpening = phase === "opening" || phase === "revealing";
  const isRevealing = phase === "revealing";

  return (
    <>
      <style>{`
        @keyframes sealShake {
          0%,100% { transform: translate(-50%,-50%) rotate(0deg) scale(1); }
          15%      { transform: translate(-50%,-50%) rotate(-4deg) scale(1.05); }
          30%      { transform: translate(-50%,-50%) rotate(4deg) scale(0.97); }
          45%      { transform: translate(-50%,-50%) rotate(-3deg) scale(1.03); }
          60%      { transform: translate(-50%,-50%) rotate(2deg) scale(0.99); }
          75%      { transform: translate(-50%,-50%) rotate(-1deg) scale(1.01); }
        }
        @keyframes sealBreak {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity:1; }
          100% { transform: translate(-50%,-50%) scale(1.4); opacity:0; }
        }
        @keyframes topFlapOpen {
          0%   { transform: rotateX(0deg);   }
          100% { transform: rotateX(-170deg); }
        }
        @keyframes sideLeftOpen {
          0%   { transform: skewY(0deg) translateX(0);    opacity:1; }
          100% { transform: skewY(0deg) translateX(-110%); opacity:0.4; }
        }
        @keyframes sideRightOpen {
          0%   { transform: skewY(0deg) translateX(0);   opacity:1; }
          100% { transform: skewY(0deg) translateX(110%); opacity:0.4; }
        }
        @keyframes bottomFlapDrop {
          0%   { transform: rotateX(0deg);   }
          100% { transform: rotateX(20deg); }
        }
        @keyframes cardRise {
          0%   { transform: translateY(40px) scale(0.96); opacity:0; }
          100% { transform: translateY(-60px) scale(1);   opacity:1; }
        }
        @keyframes envelopeFade {
          0%   { opacity:1; transform: scale(1);   }
          100% { opacity:0; transform: scale(0.9); }
        }
        @keyframes overlayFade {
          0%   { opacity:1; }
          100% { opacity:0; }
        }
        @keyframes tapHint {
          0%,100% { transform: translate(-50%,-50%) scale(1);   opacity:0.7; }
          50%      { transform: translate(-50%,-50%) scale(1.12); opacity:1; }
        }

        .seal-idle     { transform: translate(-50%,-50%) scale(1); cursor:pointer; transition: transform 0.2s; }
        .seal-idle:hover { transform: translate(-50%,-50%) scale(1.06); }
        .seal-breaking { animation: sealShake 0.55s ease-in-out forwards; }
        .seal-broken   { animation: sealBreak 0.35s ease-in forwards; }

        .top-flap-open  { transform-origin: top center; animation: topFlapOpen 0.9s cubic-bezier(0.4,0,0.2,1) forwards; }
        .side-left-open { animation: sideLeftOpen 0.7s cubic-bezier(0.4,0,0.2,1) 0.3s forwards; }
        .side-right-open{ animation: sideRightOpen 0.7s cubic-bezier(0.4,0,0.2,1) 0.3s forwards; }
        .bottom-drop    { transform-origin: bottom center; animation: bottomFlapDrop 0.6s ease-in-out 0.2s forwards; }

        .card-rise      { animation: cardRise 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }
        .envelope-fade  { animation: envelopeFade 0.7s ease-in-out forwards; }
        .overlay-fade   { animation: overlayFade 0.7s ease-in-out 0.4s forwards; }

        .tap-hint       { animation: tapHint 2s ease-in-out infinite; }
      `}</style>

      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center ${isRevealing ? "overlay-fade pointer-events-none" : ""}`}
        style={{ background: "#1a1a1a" }}
      >
        {/* Background texture — subtle noise */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }} />

        {/* Envelope wrapper */}
        <div
          className={`relative ${isRevealing ? "envelope-fade" : ""}`}
          style={{
            width: "min(80vw, 520px)",
            height: "min(56vw, 364px)",
            perspective: "1200px",
          }}
        >
          {/* ── Envelope body (back) ── */}
          <div
            className="absolute inset-0 rounded-sm shadow-2xl"
            style={{ background: envelopeColor, zIndex: 1 }}
          />

          {/* ── Bottom flap (triangle pointing up from bottom) ── */}
          <div
            className={`absolute bottom-0 left-0 right-0 ${isOpening ? "bottom-drop" : ""}`}
            style={{
              height: "55%",
              zIndex: 2,
              overflow: "hidden",
            }}
          >
            <div style={{
              width: "100%",
              height: "100%",
              background: envelopeColor,
              clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)",
              filter: "brightness(0.88)",
            }} />
          </div>

          {/* ── Side flap left ── */}
          <div
            className={`absolute top-0 left-0 bottom-0 ${isOpening ? "side-left-open" : ""}`}
            style={{ width: "52%", zIndex: 3, overflow: "hidden" }}
          >
            <div style={{
              width: "100%",
              height: "100%",
              background: envelopeColor,
              clipPath: "polygon(0% 0%, 100% 50%, 0% 100%)",
              filter: "brightness(0.82)",
            }} />
          </div>

          {/* ── Side flap right ── */}
          <div
            className={`absolute top-0 right-0 bottom-0 ${isOpening ? "side-right-open" : ""}`}
            style={{ width: "52%", zIndex: 3, overflow: "hidden" }}
          >
            <div style={{
              width: "100%",
              height: "100%",
              background: envelopeColor,
              clipPath: "polygon(100% 0%, 0% 50%, 100% 100%)",
              filter: "brightness(0.82)",
            }} />
          </div>

          {/* ── Top flap ── */}
          <div
            className={`absolute top-0 left-0 right-0 ${isOpening ? "top-flap-open" : ""}`}
            style={{
              height: "55%",
              zIndex: isOpening ? 5 : 4,
              transformStyle: "preserve-3d",
              overflow: "hidden",
            }}
          >
            <div style={{
              width: "100%",
              height: "100%",
              background: envelopeColor,
              clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
              filter: "brightness(0.93)",
            }} />
          </div>

          {/* ── Wax seal ── */}
          {phase !== "opening" && phase !== "revealing" && (
            <div
              className={`absolute ${
                phase === "idle" ? "seal-idle tap-hint" :
                phase === "breaking" ? "seal-breaking" :
                "seal-broken"
              }`}
              style={{
                left: "50%",
                top: "50%",
                width: "min(16vw, 100px)",
                height: "min(16vw, 100px)",
                zIndex: 10,
              }}
              onClick={handleSealClick}
            >
              {/* Outer seal ring */}
              <svg
                viewBox="0 0 100 100"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}
              >
                {/* Outer decorative ring */}
                <circle cx="50" cy="50" r="47" fill={sealColor} />
                <circle cx="50" cy="50" r="43" fill="none" stroke={sealColor} strokeWidth="1" style={{ filter: "brightness(0.85)" }} />
                {/* Inner ring — slightly darker */}
                <circle cx="50" cy="50" r="38" fill={sealColor} style={{ filter: "brightness(0.92)" }} />
                {/* Decorative dots around ring */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i / 24) * 2 * Math.PI;
                  const r = 44;
                  const x = 50 + r * Math.cos(angle);
                  const y = 50 + r * Math.sin(angle);
                  return <circle key={i} cx={x} cy={y} r="1.2" fill={sealColor} style={{ filter: "brightness(0.7)" }} />;
                })}
                {/* Wax texture lines */}
                <circle cx="50" cy="50" r="36" fill="none" stroke={sealColor} strokeWidth="0.5" style={{ filter: "brightness(0.78)" }} />
              </svg>

              {/* Monogram or initials */}
              {monogramUrl ? (
                <img
                  src={monogramUrl}
                  alt="monograma"
                  style={{
                    position: "absolute",
                    inset: "20%",
                    width: "60%",
                    height: "60%",
                    objectFit: "contain",
                    mixBlendMode: "multiply",
                    opacity: 0.7,
                  }}
                />
              ) : (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "min(5vw, 28px)",
                    color: sealColor,
                    filter: "brightness(0.55)",
                    letterSpacing: "0.05em",
                    fontStyle: "italic",
                  }}>{initials}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Card rising from envelope ── */}
          {isOpening && (
            <div
              className="card-rise absolute"
              style={{
                left: "10%",
                right: "10%",
                bottom: "15%",
                zIndex: 6,
                background: "#FAF7F2",
                borderRadius: "2px",
                padding: "min(4vw, 24px) min(5vw, 32px)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
                textAlign: "center",
              }}
            >
              <div style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "min(2vw, 11px)",
                color: envelopeColor,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "0.5em",
                opacity: 0.6,
              }}>
                Com a bênção de nossas famílias
              </div>
              <div style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "min(5.5vw, 32px)",
                color: "#1a1a1a",
                lineHeight: 1.1,
              }}>
                {name1}
                <span style={{ display: "block", fontSize: "0.55em", margin: "0.2em 0", color: envelopeColor }}>&amp;</span>
                {name2}
              </div>
            </div>
          )}
        </div>

        {/* Tap hint text */}
        {phase === "idle" && (
          <div
            className="absolute tap-hint"
            style={{
              bottom: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "system-ui, sans-serif",
              fontSize: "min(3.5vw, 13px)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              pointerEvents: "none",
            }}
          >
            Toque no lacre para abrir
          </div>
        )}
      </div>
    </>
  );
}
