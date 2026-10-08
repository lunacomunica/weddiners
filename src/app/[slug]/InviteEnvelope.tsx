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

export function InviteEnvelope({ envelopeColor, sealColor, monogramUrl, envelopeImageUrl, sealX = 50, sealY = 50, sealScale = 1, name1, name2 }: Props) {
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
        {/* Se tiver imagem do envelope: usa ela como fundo e oculta o CSS envelope */}
        {envelopeImageUrl && (
          <img
            src={envelopeImageUrl}
            alt=""
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              zIndex: 9,
            }}
          />
        )}

        {/* Linen texture — só aparece sem imagem */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15, pointerEvents: "none", zIndex: envelopeImageUrl ? -1 : 1 }}>
          <defs>
            <filter id="env-linen">
              <feTurbulence type="fractalNoise" baseFrequency="0.65 0.9" numOctaves="4" seed="7" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#env-linen)" fill="white" />
        </svg>

        {/* Botanical full-coverage pattern — só sem imagem */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18, pointerEvents: "none", zIndex: 2, display: envelopeImageUrl ? "none" : undefined }}
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

        {/* Envelope flaps — só aparece sem imagem */}
        <div className={`absolute inset-0 ${isOpening ? "flap-top" : ""}`} style={{ zIndex: 3, display: envelopeImageUrl ? "none" : undefined, transformStyle: "preserve-3d", perspective: "800px" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: envelopeColor,
            clipPath: "polygon(0% 0%, 100% 0%, 50% 52%)",
            filter: "brightness(0.9)",
          }} />
        </div>

        <div className={`absolute inset-0 ${isOpening ? "flap-bottom" : ""}`} style={{ zIndex: 3, display: envelopeImageUrl ? "none" : undefined, transformStyle: "preserve-3d", perspective: "800px" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: envelopeColor,
            clipPath: "polygon(0% 100%, 100% 100%, 50% 52%)",
            filter: "brightness(0.84)",
          }} />
        </div>

        <div className={`absolute inset-0 ${isOpening ? "flap-left" : ""}`} style={{ zIndex: 3, display: envelopeImageUrl ? "none" : undefined, transformStyle: "preserve-3d", perspective: "800px" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: envelopeColor,
            clipPath: "polygon(0% 0%, 52% 50%, 0% 100%)",
            filter: "brightness(0.87)",
          }} />
        </div>

        <div className={`absolute inset-0 ${isOpening ? "flap-right" : ""}`} style={{ zIndex: 3, display: envelopeImageUrl ? "none" : undefined, transformStyle: "preserve-3d", perspective: "800px" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: envelopeColor,
            clipPath: "polygon(100% 0%, 48% 50%, 100% 100%)",
            filter: "brightness(0.87)",
          }} />
        </div>

        {/* Flap seam lines */}
        {!isOpening && !envelopeImageUrl && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 4, pointerEvents: "none", opacity: 0.25 }}>
            <line x1="0" y1="0" x2="50%" y2="52%" stroke="white" strokeWidth="0.8" />
            <line x1="100%" y1="0" x2="50%" y2="52%" stroke="white" strokeWidth="0.8" />
            <line x1="0" y1="100%" x2="50%" y2="52%" stroke="white" strokeWidth="0.8" />
            <line x1="100%" y1="100%" x2="50%" y2="52%" stroke="white" strokeWidth="0.8" />
          </svg>
        )}

        {/* Wax seal — realistic */}
        {!isOpening && (
          <div
            className={`absolute ${
              phase === "idle" ? "seal-idle tap-pulse" :
              phase === "breaking" ? "seal-break" : "seal-gone"
            }`}
            style={{
              left: `${sealX}%`, top: `${sealY}%`,
              width: `clamp(${Math.round(70 * sealScale)}px, ${Math.round(22 * sealScale)}vw, ${Math.round(140 * sealScale)}px)`,
              height: `clamp(${Math.round(70 * sealScale)}px, ${Math.round(22 * sealScale)}vw, ${Math.round(140 * sealScale)}px)`,
              zIndex: 10,
            }}
            onClick={handleSealClick}
          >
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                {/* Organic edge displacement */}
                <filter id="wax-edge" x="-18%" y="-18%" width="136%" height="136%">
                  <feTurbulence type="turbulence" baseFrequency="0.038" numOctaves="4" seed="9" result="noise"/>
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G"/>
                </filter>
                {/* Depth shadow */}
                <filter id="wax-shadow" x="-25%" y="-15%" width="150%" height="155%">
                  <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="rgba(0,0,0,0.5)"/>
                </filter>
                {/* 3D radial gradient — bright top-left, dark bottom-right */}
                <radialGradient id="wax-3d" cx="36%" cy="30%" r="72%" fx="28%" fy="22%">
                  <stop offset="0%"   stopColor="white" stopOpacity="0.55"/>
                  <stop offset="25%"  stopColor="white" stopOpacity="0.15"/>
                  <stop offset="55%"  stopColor="black" stopOpacity="0"/>
                  <stop offset="100%" stopColor="black" stopOpacity="0.42"/>
                </radialGradient>
                {/* Inner disc gradient */}
                <radialGradient id="wax-inner" cx="40%" cy="34%" r="68%">
                  <stop offset="0%"   stopColor="white" stopOpacity="0.22"/>
                  <stop offset="100%" stopColor="black" stopOpacity="0.28"/>
                </radialGradient>
                {/* Groove ring gradient */}
                <radialGradient id="groove-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="black" stopOpacity="0.18"/>
                  <stop offset="100%" stopColor="white" stopOpacity="0.08"/>
                </radialGradient>
                {/* Specular highlight */}
                <radialGradient id="specular" cx="30%" cy="22%" r="45%">
                  <stop offset="0%"   stopColor="white" stopOpacity="0.7"/>
                  <stop offset="50%"  stopColor="white" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="white" stopOpacity="0"/>
                </radialGradient>
                {/* Wax surface noise */}
                <filter id="wax-texture" x="0%" y="0%" width="100%" height="100%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.25" numOctaves="3" seed="4" result="noise"/>
                  <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
                  <feBlend in="SourceGraphic" in2="gray" mode="soft-light" result="blend"/>
                  <feComposite in="blend" in2="SourceGraphic" operator="in"/>
                </filter>
                <clipPath id="seal-clip">
                  <circle cx="60" cy="60" r="54"/>
                </clipPath>
              </defs>

              {/* Outer bumpy wax body */}
              <g filter="url(#wax-shadow)">
                <circle cx="60" cy="60" r="54" fill={sealColor} filter="url(#wax-edge)"/>
              </g>

              {/* Surface wax texture */}
              <circle cx="60" cy="60" r="54" fill={sealColor} filter="url(#wax-texture)" clipPath="url(#seal-clip)"/>

              {/* 3D light/shadow overlay */}
              <circle cx="60" cy="60" r="54" fill="url(#wax-3d)"/>

              {/* Outer groove ring */}
              <circle cx="60" cy="60" r="46" fill="none" stroke="black" strokeWidth="2.5" strokeOpacity="0.18"/>
              <circle cx="60" cy="60" r="46" fill="none" stroke="white" strokeWidth="1"   strokeOpacity="0.12"/>

              {/* Inner raised disc */}
              <circle cx="60" cy="60" r="40" fill={sealColor}/>
              <circle cx="60" cy="60" r="40" fill="url(#wax-inner)"/>

              {/* Inner groove */}
              <circle cx="60" cy="60" r="40" fill="none" stroke="black" strokeWidth="1.5" strokeOpacity="0.12"/>

              {/* Specular highlight — glossy top-left */}
              <ellipse cx="44" cy="38" rx="17" ry="11"
                fill="url(#specular)"
                transform="rotate(-25 44 38)"/>

              {/* Small secondary highlight */}
              <ellipse cx="38" cy="34" rx="6" ry="4"
                fill="white" fillOpacity="0.35"
                transform="rotate(-20 38 34)"/>
            </svg>

            {/* Se subiu PNG do lacre: substitui o SVG inteiro */}
            {monogramUrl && (
              <img src={monogramUrl} alt="lacre" style={{
                position: "absolute",
                inset: 0, width: "100%", height: "100%",
                objectFit: "contain",
              }} />
            )}

            {/* Sem imagem: iniciais sobre o SVG */}
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
