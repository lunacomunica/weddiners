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
    setTimeout(() => setPhase("revealing"), 1800);
    setTimeout(() => setPhase("done"), 2600);
  }

  if (!mounted || phase === "done") return null;

  const initials = `${name1[0] ?? ""}${name2[0] ?? ""}`.toUpperCase();
  const isOpening = phase === "opening" || phase === "revealing";
  const isRevealing = phase === "revealing";

  return (
    <>
      <style>{`
        @keyframes sealShake {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          20%      { transform: translate(-50%,-50%) rotate(-5deg) scale(1.06); }
          40%      { transform: translate(-50%,-50%) rotate(5deg) scale(0.96); }
          60%      { transform: translate(-50%,-50%) rotate(-3deg) scale(1.03); }
          80%      { transform: translate(-50%,-50%) rotate(2deg) scale(0.99); }
        }
        @keyframes sealBreak {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity:1; }
          100% { transform: translate(-50%,-50%) scale(1.5); opacity:0; }
        }
        @keyframes topFlapOpen {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-175deg); }
        }
        @keyframes bottomFlapOpen {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(175deg); }
        }
        @keyframes leftFlapOpen {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(-175deg); }
        }
        @keyframes rightFlapOpen {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(175deg); }
        }
        @keyframes envelopeFade {
          0%   { opacity:1; transform: scale(1); }
          100% { opacity:0; transform: scale(1.04); }
        }
        @keyframes overlayFade {
          0%   { opacity:1; }
          100% { opacity:0; }
        }
        @keyframes tapPulse {
          0%,100% { transform: translate(-50%,-50%) scale(1);    opacity:0.85; }
          50%      { transform: translate(-50%,-50%) scale(1.08); opacity:1; }
        }
        @keyframes arrowBounce {
          0%,100% { opacity: 0.45; transform: translateX(-50%) translateY(0); }
          50%      { opacity: 0.9;  transform: translateX(-50%) translateY(8px); }
        }

        .seal-idle    { cursor: pointer; }
        .seal-idle:hover { filter: brightness(1.08); }
        .seal-break   { animation: sealShake 0.55s ease-in-out forwards; }
        .seal-gone    { animation: sealBreak 0.4s ease-in forwards; }

        .flap-top     { transform-origin: top center;    animation: topFlapOpen    1s cubic-bezier(0.4,0,0.2,1) forwards; }
        .flap-bottom  { transform-origin: bottom center; animation: bottomFlapOpen 0.9s cubic-bezier(0.4,0,0.2,1) 0.15s forwards; }
        .flap-left    { transform-origin: left center;   animation: leftFlapOpen   0.9s cubic-bezier(0.4,0,0.2,1) 0.1s forwards; }
        .flap-right   { transform-origin: right center;  animation: rightFlapOpen  0.9s cubic-bezier(0.4,0,0.2,1) 0.1s forwards; }

        .env-fade     { animation: envelopeFade 0.8s ease-in-out forwards; }
        .overlay-fade { animation: overlayFade  0.8s ease-in-out 0.3s forwards; }
        .tap-pulse    { animation: tapPulse 2.2s ease-in-out infinite; }
        .arrow-bounce { animation: arrowBounce 2s ease-in-out infinite; }
      `}</style>

      {/* Full-screen overlay */}
      <div
        className={`fixed inset-0 z-[9999] ${isRevealing ? "overlay-fade pointer-events-none" : ""}`}
        style={{ background: envelopeColor }}
      >
        {/* Linen texture */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15, pointerEvents: "none", zIndex: 1 }}>
          <defs>
            <filter id="env-linen">
              <feTurbulence type="fractalNoise" baseFrequency="0.65 0.9" numOctaves="4" seed="7" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#env-linen)" fill="white" />
        </svg>

        {/* Botanical full-coverage pattern */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18, pointerEvents: "none", zIndex: 2 }}
          viewBox="0 0 390 844"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top-left large botanical */}
          <g fill="none" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
            {/* Large top-left stem */}
            <path d="M-10,60 Q30,120 10,200 Q-5,270 20,340" />
            <path d="M10,200 Q-30,190 -50,160" />
            <path d="M10,200 Q50,210 70,180" />
            <path d="M20,260 Q-10,250 -30,225" />
            <path d="M20,260 Q55,265 70,240" />
            {/* Flower top-left */}
            <circle cx="10" cy="80" r="8" />
            <path d="M10,68 Q18,60 26,65" /><path d="M10,68 Q2,60 -6,65" />
            <path d="M22,75 Q28,67 24,58" /><path d="M-2,75 Q-8,67 -4,58" />
            {/* Leaf sprays top-left */}
            <path d="M-20,140 Q10,130 30,145 Q10,158 -20,150 Z" />
            <path d="M30,160 Q60,148 80,162 Q60,175 30,168 Z" />
            <path d="M-10,220 Q20,208 42,222 Q20,236 -10,228 Z" />
            <path d="M25,300 Q55,290 72,305 Q55,318 25,310 Z" />
            {/* Feather bottom-left */}
            <path d="M-20,700 Q10,740 -5,800 Q-18,840 -5,880" />
            <path d="M-5,720 Q-25,730 -35,720" /><path d="M-5,720 Q15,730 22,718" />
            <path d="M-8,750 Q-28,758 -38,748" /><path d="M-8,750 Q12,758 18,747" />
            <path d="M-6,780 Q-24,787 -32,778" /><path d="M-6,780 Q10,787 15,776" />
            <path d="M-10,810 Q-26,816 -33,808" /><path d="M-10,810 Q6,816 10,806" />
          </g>

          {/* Top-right botanical */}
          <g fill="none" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" transform="translate(390,0) scale(-1,1)">
            <path d="M-10,60 Q30,120 10,200 Q-5,270 20,340" />
            <path d="M10,200 Q-30,190 -50,160" />
            <path d="M10,200 Q50,210 70,180" />
            <path d="M20,260 Q-10,250 -30,225" />
            <path d="M20,260 Q55,265 70,240" />
            <circle cx="10" cy="80" r="8" />
            <path d="M10,68 Q18,60 26,65" /><path d="M10,68 Q2,60 -6,65" />
            <path d="M22,75 Q28,67 24,58" /><path d="M-2,75 Q-8,67 -4,58" />
            <path d="M-20,140 Q10,130 30,145 Q10,158 -20,150 Z" />
            <path d="M30,160 Q60,148 80,162 Q60,175 30,168 Z" />
            <path d="M-10,220 Q20,208 42,222 Q20,236 -10,228 Z" />
            <path d="M25,300 Q55,290 72,305 Q55,318 25,310 Z" />
            <path d="M-20,700 Q10,740 -5,800 Q-18,840 -5,880" />
            <path d="M-5,720 Q-25,730 -35,720" /><path d="M-5,720 Q15,730 22,718" />
            <path d="M-8,750 Q-28,758 -38,748" /><path d="M-8,750 Q12,758 18,747" />
            <path d="M-6,780 Q-24,787 -32,778" /><path d="M-6,780 Q10,787 15,776" />
            <path d="M-10,810 Q-26,816 -33,808" /><path d="M-10,810 Q6,816 10,806" />
          </g>

          {/* Bottom botanical sprays */}
          <g fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M80,844 Q120,800 110,750 Q100,700 130,660" />
            <path d="M110,750 Q80,745 60,725" /><path d="M110,750 Q140,742 158,722" />
            <path d="M120,710 Q95,700 78,682" /><path d="M120,710 Q148,702 162,685" />
            <path d="M310,844 Q270,800 280,750 Q290,700 260,660" />
            <path d="M280,750 Q310,745 330,725" /><path d="M280,750 Q250,742 232,722" />
            <path d="M270,710 Q295,700 312,682" /><path d="M270,710 Q242,702 228,685" />
          </g>

          {/* Crosshatch center-top area */}
          <g stroke="white" strokeWidth="0.5" opacity="0.4">
            <path d="M120,20 L240,20 M120,32 L240,32 M120,44 L240,44" />
            <path d="M148,8 L148,56 M172,8 L172,56 M196,8 L196,56 M220,8 L220,56" />
          </g>
        </svg>

        {/* Envelope flaps — 4 triangles meeting in center */}
        <div className={`absolute inset-0 ${isOpening ? "flap-top" : ""}`} style={{ zIndex: 3, transformStyle: "preserve-3d", perspective: "800px" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: envelopeColor,
            clipPath: "polygon(0% 0%, 100% 0%, 50% 52%)",
            filter: "brightness(0.9)",
          }} />
        </div>

        <div className={`absolute inset-0 ${isOpening ? "flap-bottom" : ""}`} style={{ zIndex: 3, transformStyle: "preserve-3d", perspective: "800px" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: envelopeColor,
            clipPath: "polygon(0% 100%, 100% 100%, 50% 52%)",
            filter: "brightness(0.84)",
          }} />
        </div>

        <div className={`absolute inset-0 ${isOpening ? "flap-left" : ""}`} style={{ zIndex: 3, transformStyle: "preserve-3d", perspective: "800px" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: envelopeColor,
            clipPath: "polygon(0% 0%, 52% 50%, 0% 100%)",
            filter: "brightness(0.87)",
          }} />
        </div>

        <div className={`absolute inset-0 ${isOpening ? "flap-right" : ""}`} style={{ zIndex: 3, transformStyle: "preserve-3d", perspective: "800px" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: envelopeColor,
            clipPath: "polygon(100% 0%, 48% 50%, 100% 100%)",
            filter: "brightness(0.87)",
          }} />
        </div>

        {/* Flap seam lines */}
        {!isOpening && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 4, pointerEvents: "none", opacity: 0.25 }}>
            <line x1="0" y1="0" x2="50%" y2="52%" stroke="white" strokeWidth="0.8" />
            <line x1="100%" y1="0" x2="50%" y2="52%" stroke="white" strokeWidth="0.8" />
            <line x1="0" y1="100%" x2="50%" y2="52%" stroke="white" strokeWidth="0.8" />
            <line x1="100%" y1="100%" x2="50%" y2="52%" stroke="white" strokeWidth="0.8" />
          </svg>
        )}

        {/* Wax seal */}
        {!isOpening && (
          <div
            className={`absolute ${
              phase === "idle" ? "seal-idle tap-pulse" :
              phase === "breaking" ? "seal-break" : "seal-gone"
            }`}
            style={{
              left: "50%", top: "50%",
              width: "clamp(80px, 22vw, 130px)",
              height: "clamp(80px, 22vw, 130px)",
              zIndex: 10,
            }}
            onClick={handleSealClick}
          >
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))" }}>
              {/* Outer ring */}
              <circle cx="50" cy="50" r="48" fill={sealColor} />
              {/* Decorative dots ring */}
              {Array.from({ length: 32 }).map((_, i) => {
                const a = (i / 32) * 2 * Math.PI;
                return <circle key={i} cx={50 + 44 * Math.cos(a)} cy={50 + 44 * Math.sin(a)} r="1" fill={sealColor} style={{ filter: "brightness(0.65)" }} />;
              })}
              {/* Inner circles */}
              <circle cx="50" cy="50" r="40" fill={sealColor} style={{ filter: "brightness(0.94)" }} />
              <circle cx="50" cy="50" r="36" fill={sealColor} style={{ filter: "brightness(0.88)" }} />
              {/* Wax texture radial lines */}
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * 2 * Math.PI;
                return <line key={i} x1={50 + 18 * Math.cos(a)} y1={50 + 18 * Math.sin(a)} x2={50 + 34 * Math.cos(a)} y2={50 + 34 * Math.sin(a)} stroke={sealColor} strokeWidth="0.7" style={{ filter: "brightness(0.7)" }} />;
              })}
            </svg>

            {/* Monogram or initials */}
            {monogramUrl ? (
              <img src={monogramUrl} alt="" style={{
                position: "absolute", inset: "22%", width: "56%", height: "56%",
                objectFit: "contain", mixBlendMode: "multiply", opacity: 0.65,
              }} />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "clamp(18px, 6vw, 36px)",
                  color: sealColor, filter: "brightness(0.5)",
                  fontStyle: "italic", letterSpacing: "0.04em",
                }}>{initials}</span>
              </div>
            )}
          </div>
        )}

        {/* Tap hint arrow */}
        {phase === "idle" && (
          <div className="arrow-bounce" style={{
            position: "absolute", bottom: "8%", left: "50%",
            transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            zIndex: 11, pointerEvents: "none",
          }}>
            <span style={{
              color: "rgba(255,255,255,0.55)",
              fontFamily: "system-ui, sans-serif",
              fontSize: "clamp(10px, 2.5vw, 12px)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}>Toque no lacre</span>
            <svg width="18" height="18" fill="none" stroke="white" strokeWidth={1.5} viewBox="0 0 24 24" style={{ opacity: 0.55 }}>
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </>
  );
}
