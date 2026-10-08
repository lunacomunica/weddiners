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

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          animation: "coverScrollHint 2s ease-in-out infinite",
        }}
      >
        <style>{`
          @keyframes coverScrollHint {
            0%,100% { opacity: 0.5; transform: translateX(-50%) translateY(0); }
            50%      { opacity: 1;   transform: translateX(-50%) translateY(6px); }
          }
        `}</style>
        <svg width="20" height="20" fill="none" stroke="white" strokeWidth={1.5} viewBox="0 0 24 24"
          style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }}>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  );
}
