"use client";

interface Props {
  imageUrl: string;
}

export function InviteCoverSection({ imageUrl }: Props) {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        overflow: "hidden",
      }}
    >
      <img
        src={imageUrl}
        alt="Convite"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />

      {/* Gradient fade at bottom */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: 140,
        background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* Scroll indicator */}
      <style>{`
        @keyframes coverArrow1 {
          0%,100% { opacity: 0.4; transform: translateY(0); }
          50%      { opacity: 1;   transform: translateY(5px); }
        }
        @keyframes coverArrow2 {
          0%,100% { opacity: 0.2; transform: translateY(0); }
          50%      { opacity: 0.7; transform: translateY(5px); }
        }
      `}</style>
      <div style={{
        position: "absolute",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        zIndex: 2,
      }}>
        <span style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontFamily: "system-ui, sans-serif",
          marginBottom: 6,
          textShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}>
          Ver detalhes
        </span>
        <svg width="22" height="14" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 22 14"
          style={{ animation: "coverArrow1 1.6s ease-in-out infinite", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}>
          <path d="M2 2l9 9 9-9" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg width="22" height="14" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 22 14"
          style={{ animation: "coverArrow2 1.6s ease-in-out 0.2s infinite", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))", marginTop: -6 }}>
          <path d="M2 2l9 9 9-9" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  );
}
