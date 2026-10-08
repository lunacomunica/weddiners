"use client";

import { useState, useEffect } from "react";

interface Props {
  envelopeColor: string;
  sealColor: string;
  monogramUrl: string | null;
  envelopeImageUrl: string | null;
  sealX?: number;
  sealY?: number;
  sealScale?: number;
  name1: string;
  name2: string;
}

type Phase = "idle" | "breaking" | "opening" | "revealing" | "done";

export function InviteEnvelope({
  envelopeColor, sealColor, monogramUrl, envelopeImageUrl,
  sealX = 50, sealY = 50, sealScale = 1, name1, name2,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function handleSealClick() {
    if (phase !== "idle") return;
    setPhase("breaking");
    setTimeout(() => setPhase("opening"),   600);
    setTimeout(() => setPhase("revealing"), 2500);
    setTimeout(() => setPhase("done"),      3300);
  }

  if (!mounted || phase === "done") return null;

  const initials = `${name1[0] ?? ""}${name2[0] ?? ""}`.toUpperCase();
  const showSeal  = phase === "idle" || phase === "breaking";
  const isOpening   = phase === "opening" || phase === "revealing";
  const isRevealing = phase === "revealing";
  const sealW = `clamp(${Math.round(70 * sealScale)}px, ${Math.round(22 * sealScale)}vw, ${Math.round(140 * sealScale)}px)`;

  return (
    <>
      <style>{`
        /* ── Seal idle ── */
        @keyframes tapPulse {
          0%,100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.9; }
          50%      { transform: translate(-50%,-50%) scale(1.07); opacity: 1;   }
        }
        /* ── Seal shake + fade out ── */
        @keyframes sealBreakOut {
          0%   { transform: translate(-50%,-50%) rotate(0deg)  scale(1);    opacity: 1; }
          20%  { transform: translate(-50%,-50%) rotate(-4deg) scale(1.06); opacity: 1; }
          40%  { transform: translate(-50%,-50%) rotate(4deg)  scale(0.97); opacity: 0.9; }
          60%  { transform: translate(-50%,-50%) rotate(-2deg) scale(1.03); opacity: 0.7; }
          100% { transform: translate(-50%,-50%) rotate(0deg)  scale(1.15); opacity: 0; }
        }
        /* ── Flap opens ── */
        @keyframes topFlapOpen {
          0%   { transform: rotateX(0deg); }
          80%  { transform: rotateX(-185deg); }
          100% { transform: rotateX(-178deg); }
        }
        @keyframes bottomFlapOpen {
          0%   { transform: rotateX(0deg); }
          80%  { transform: rotateX(185deg); }
          100% { transform: rotateX(178deg); }
        }
        @keyframes leftFlapOpen {
          0%   { transform: rotateY(0deg); }
          80%  { transform: rotateY(-185deg); }
          100% { transform: rotateY(-178deg); }
        }
        @keyframes rightFlapOpen {
          0%   { transform: rotateY(0deg); }
          80%  { transform: rotateY(185deg); }
          100% { transform: rotateY(178deg); }
        }
        /* ── Letter card emerge ── */
        @keyframes letterEmerge {
          0%   { transform: translateX(-50%) translateY(40px) scale(0.94); opacity: 0; }
          60%  { transform: translateX(-50%) translateY(-6px)  scale(1.01); opacity: 1; }
          100% { transform: translateX(-50%) translateY(0px)   scale(1);    opacity: 1; }
        }
        @keyframes letterFade {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.96); }
        }
        /* ── Overlay fades ── */
        @keyframes overlayFade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        /* ── Bottom hint ── */
        @keyframes arrowBounce {
          0%,100% { opacity: 0.45; transform: translateX(-50%) translateY(0); }
          50%      { opacity: 0.9;  transform: translateX(-50%) translateY(8px); }
        }
        /* ── Flap classes ── */
        .flap-top    { transform-origin: top center;    animation: topFlapOpen    0.82s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        .flap-bottom { transform-origin: bottom center; animation: bottomFlapOpen 0.78s cubic-bezier(0.25,0.46,0.45,0.94) 0.28s forwards; }
        .flap-left   { transform-origin: left center;   animation: leftFlapOpen   0.76s cubic-bezier(0.25,0.46,0.45,0.94) 0.18s forwards; }
        .flap-right  { transform-origin: right center;  animation: rightFlapOpen  0.76s cubic-bezier(0.25,0.46,0.45,0.94) 0.14s forwards; }
        /* ── Seal classes ── */
        .seal-idle       { cursor: pointer; }
        .seal-idle:hover { filter: brightness(1.1); }
        .seal-breaking   { animation: sealBreakOut 0.55s ease-in-out forwards; }
        /* ── Arrow ── */
        .arrow-bounce { animation: arrowBounce 2s ease-in-out infinite; }
        .tap-pulse    { animation: tapPulse 2.2s ease-in-out infinite; }
      `}</style>

      {/* ── Full-screen overlay ── */}
      <div
        className={`fixed inset-0 z-[9999]${isRevealing ? " pointer-events-none" : ""}`}
        style={{
          background: envelopeColor,
          animation: isRevealing ? "overlayFade 0.9s ease-in-out 0.35s forwards" : undefined,
        }}
      >

        {/* Envelope image bg */}
        {envelopeImageUrl && (
          <img src={envelopeImageUrl} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", zIndex: 9,
          }} />
        )}

        {/* Linen texture */}
        {!envelopeImageUrl && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.13, pointerEvents: "none", zIndex: 1 }}>
            <defs>
              <filter id="env-linen">
                <feTurbulence type="fractalNoise" baseFrequency="0.65 0.9" numOctaves="4" seed="7" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
            </defs>
            <rect width="100%" height="100%" filter="url(#env-linen)" fill="white" />
          </svg>
        )}

        {/* Botanical pattern */}
        {!envelopeImageUrl && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.17, pointerEvents: "none", zIndex: 2 }}
            viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M-10,60 Q30,120 10,200 Q-5,270 20,340" />
              <path d="M10,200 Q-30,190 -50,160" /><path d="M10,200 Q50,210 70,180" />
              <path d="M20,260 Q-10,250 -30,225" /><path d="M20,260 Q55,265 70,240" />
              <circle cx="10" cy="80" r="8" />
              <path d="M-20,140 Q10,130 30,145 Q10,158 -20,150 Z" />
              <path d="M30,160 Q60,148 80,162 Q60,175 30,168 Z" />
              <path d="M-10,220 Q20,208 42,222 Q20,236 -10,228 Z" />
              <path d="M-20,700 Q10,740 -5,800 Q-18,840 -5,880" />
            </g>
            <g fill="none" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" transform="translate(390,0) scale(-1,1)">
              <path d="M-10,60 Q30,120 10,200 Q-5,270 20,340" />
              <path d="M10,200 Q-30,190 -50,160" /><path d="M10,200 Q50,210 70,180" />
              <path d="M20,260 Q-10,250 -30,225" /><path d="M20,260 Q55,265 70,240" />
              <circle cx="10" cy="80" r="8" />
              <path d="M-20,140 Q10,130 30,145 Q10,158 -20,150 Z" />
              <path d="M30,160 Q60,148 80,162 Q60,175 30,168 Z" />
              <path d="M-10,220 Q20,208 42,222 Q20,236 -10,228 Z" />
              <path d="M-20,700 Q10,740 -5,800 Q-18,840 -5,880" />
            </g>
          </svg>
        )}

        {/* ── Dark inner envelope (visible as flaps open) ── */}
        {!envelopeImageUrl && isOpening && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 2,
            background: `radial-gradient(ellipse at center, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.45) 100%)`,
          }} />
        )}

        {/* ── Envelope flaps ── */}
        {!envelopeImageUrl && (
          <>
            <div className={`absolute inset-0${isOpening ? " flap-top" : ""}`}
              style={{ zIndex: 3, transformStyle: "preserve-3d", perspective: "900px" }}>
              <div style={{ position: "absolute", inset: 0, background: envelopeColor,
                clipPath: "polygon(0% 0%, 100% 0%, 50% 52%)", filter: "brightness(0.92)" }} />
            </div>
            <div className={`absolute inset-0${isOpening ? " flap-bottom" : ""}`}
              style={{ zIndex: 3, transformStyle: "preserve-3d", perspective: "900px" }}>
              <div style={{ position: "absolute", inset: 0, background: envelopeColor,
                clipPath: "polygon(0% 100%, 100% 100%, 50% 52%)", filter: "brightness(0.82)" }} />
            </div>
            <div className={`absolute inset-0${isOpening ? " flap-left" : ""}`}
              style={{ zIndex: 3, transformStyle: "preserve-3d", perspective: "900px" }}>
              <div style={{ position: "absolute", inset: 0, background: envelopeColor,
                clipPath: "polygon(0% 0%, 52% 50%, 0% 100%)", filter: "brightness(0.86)" }} />
            </div>
            <div className={`absolute inset-0${isOpening ? " flap-right" : ""}`}
              style={{ zIndex: 3, transformStyle: "preserve-3d", perspective: "900px" }}>
              <div style={{ position: "absolute", inset: 0, background: envelopeColor,
                clipPath: "polygon(100% 0%, 48% 50%, 100% 100%)", filter: "brightness(0.86)" }} />
            </div>

            {/* Seam lines — só no idle */}
            {!isOpening && (
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 4, pointerEvents: "none", opacity: 0.22 }}>
                <line x1="0" y1="0" x2="50%" y2="52%" stroke="white" strokeWidth="0.7" />
                <line x1="100%" y1="0" x2="50%" y2="52%" stroke="white" strokeWidth="0.7" />
                <line x1="0" y1="100%" x2="50%" y2="52%" stroke="white" strokeWidth="0.7" />
                <line x1="100%" y1="100%" x2="50%" y2="52%" stroke="white" strokeWidth="0.7" />
              </svg>
            )}
          </>
        )}

        {/* ── Carta emergindo do envelope ── */}
        {isOpening && (
          <div style={{
            position: "absolute",
            left: "50%", bottom: "12%",
            width: "min(72%, 320px)",
            zIndex: 5,
            animation: isRevealing
              ? "letterFade 0.7s ease-in-out forwards"
              : "letterEmerge 0.65s cubic-bezier(0.25,0.46,0.45,0.94) 0.55s both",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(4px)",
              borderRadius: 16,
              padding: "28px 24px 24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.15)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            }}>
              {/* Linha decorativa */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <div style={{ flex: 1, height: 0.5, background: "rgba(0,0,0,0.15)" }} />
                <svg width="12" height="12" viewBox="0 0 24 24" fill={envelopeColor} opacity={0.4}>
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                </svg>
                <div style={{ flex: 1, height: 0.5, background: "rgba(0,0,0,0.15)" }} />
              </div>
              <p style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                fontSize: "clamp(18px, 5.5vw, 26px)",
                color: envelopeColor,
                letterSpacing: "0.03em",
                textAlign: "center",
                lineHeight: 1.3,
                margin: 0,
                filter: "brightness(0.7)",
              }}>
                {name1} <span style={{ opacity: 0.5, fontSize: "0.75em" }}>&amp;</span> {name2}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <div style={{ flex: 1, height: 0.5, background: "rgba(0,0,0,0.15)" }} />
                <svg width="12" height="12" viewBox="0 0 24 24" fill={envelopeColor} opacity={0.4}>
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                </svg>
                <div style={{ flex: 1, height: 0.5, background: "rgba(0,0,0,0.15)" }} />
              </div>
              <p style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 10,
                color: "rgba(0,0,0,0.35)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                margin: 0,
              }}>Você está convidado</p>
            </div>
          </div>
        )}

        {/* ── Seal (idle + sumindo) ── */}
        {showSeal && (
          <div
            className={`absolute${phase === "idle" ? " seal-idle tap-pulse" : " seal-breaking"}`}
            style={{ left: `${sealX}%`, top: `${sealY}%`, width: sealW, height: sealW, zIndex: 10 }}
            onClick={handleSealClick}
          >
            <SealSVG sealColor={sealColor} monogramUrl={monogramUrl} initials={initials} />
          </div>
        )}

        {/* ── Tap hint ── */}
        {phase === "idle" && (
          <div className="arrow-bounce" style={{
            position: "absolute", bottom: "8%", left: "50%",
            transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            zIndex: 11, pointerEvents: "none",
          }}>
            <span style={{
              color: envelopeImageUrl ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.55)",
              fontFamily: "system-ui, sans-serif",
              fontSize: "clamp(10px, 2.5vw, 12px)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textShadow: "0 1px 6px rgba(0,0,0,0.4)",
            }}>Toque no lacre</span>
            <svg width="18" height="18" fill="none" stroke="white" strokeWidth={1.5} viewBox="0 0 24 24"
              style={{ opacity: 0.6, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }}>
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Componente do SVG do lacre (reutilizado nas duas metades) ── */
function SealSVG({ sealColor, monogramUrl, initials }: { sealColor: string; monogramUrl: string | null; initials: string }) {
  return (
    <>
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <filter id="wax-edge" x="-18%" y="-18%" width="136%" height="136%">
            <feTurbulence type="turbulence" baseFrequency="0.038" numOctaves="4" seed="9" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
          <filter id="wax-shadow" x="-25%" y="-15%" width="150%" height="155%">
            <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="rgba(0,0,0,0.5)"/>
          </filter>
          <radialGradient id="wax-3d" cx="36%" cy="30%" r="72%" fx="28%" fy="22%">
            <stop offset="0%"   stopColor="white" stopOpacity="0.55"/>
            <stop offset="25%"  stopColor="white" stopOpacity="0.15"/>
            <stop offset="55%"  stopColor="black" stopOpacity="0"/>
            <stop offset="100%" stopColor="black" stopOpacity="0.42"/>
          </radialGradient>
          <radialGradient id="wax-inner" cx="40%" cy="34%" r="68%">
            <stop offset="0%"   stopColor="white" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="black" stopOpacity="0.28"/>
          </radialGradient>
          <radialGradient id="specular" cx="30%" cy="22%" r="45%">
            <stop offset="0%"   stopColor="white" stopOpacity="0.7"/>
            <stop offset="50%"  stopColor="white" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </radialGradient>
          <filter id="wax-texture" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.25" numOctaves="3" seed="4" result="noise"/>
            <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
            <feBlend in="SourceGraphic" in2="gray" mode="soft-light" result="blend"/>
            <feComposite in="blend" in2="SourceGraphic" operator="in"/>
          </filter>
          <clipPath id="seal-clip"><circle cx="60" cy="60" r="54"/></clipPath>
        </defs>
        <g filter="url(#wax-shadow)">
          <circle cx="60" cy="60" r="54" fill={sealColor} filter="url(#wax-edge)"/>
        </g>
        <circle cx="60" cy="60" r="54" fill={sealColor} filter="url(#wax-texture)" clipPath="url(#seal-clip)"/>
        <circle cx="60" cy="60" r="54" fill="url(#wax-3d)"/>
        <circle cx="60" cy="60" r="46" fill="none" stroke="black" strokeWidth="2.5" strokeOpacity="0.18"/>
        <circle cx="60" cy="60" r="46" fill="none" stroke="white" strokeWidth="1"   strokeOpacity="0.12"/>
        <circle cx="60" cy="60" r="40" fill={sealColor}/>
        <circle cx="60" cy="60" r="40" fill="url(#wax-inner)"/>
        <circle cx="60" cy="60" r="40" fill="none" stroke="black" strokeWidth="1.5" strokeOpacity="0.12"/>
        <ellipse cx="44" cy="38" rx="17" ry="11" fill="url(#specular)" transform="rotate(-25 44 38)"/>
        <ellipse cx="38" cy="34" rx="6"  ry="4"  fill="white" fillOpacity="0.35" transform="rotate(-20 38 34)"/>
      </svg>
      {monogramUrl && (
        <img src={monogramUrl} alt="lacre" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
      )}
      {!monogramUrl && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(20px, 6.5vw, 40px)",
            color: sealColor,
            filter: "brightness(0.42) contrast(1.2)",
            fontStyle: "italic",
            letterSpacing: "0.04em",
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
          }}>{initials}</span>
        </div>
      )}
    </>
  );
}
