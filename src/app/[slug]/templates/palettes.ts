import type { SectionColors } from "./sections";

export interface PaletteTheme extends SectionColors {
  heroBg: string;        // hero gradient fallback (sem foto)
  heroOverlay: string;   // overlay rgba sobre a foto
  countdownBg: string;   // seção de countdown
  scheduleOverlay: string;
  footerColor: string;
  buttonRadius: string;
  ornament?: string;
}

// Paleta base compartilhada (sage/clássico)
const base: PaletteTheme = {
  accent: "#7A8C6A",
  mainBg: "#F5F0E8",
  altBg: "#EDE4D0",
  text: "#1C2018",
  subText: "#7A7860",
  heroBg: "linear-gradient(135deg, #3A4A30 0%, #7A8C6A 100%)",
  heroOverlay: "rgba(0,0,0,0.38)",
  countdownBg: "#EDE4D0",
  schedulePhotoBg: "#1C2018",
  scheduleOverlay: "rgba(0,0,0,0.72)",
  footerColor: "#7A7860",
  buttonRadius: "0.375rem",
};

export const PALETTE_THEMES: Record<string, PaletteTheme> = {
  sage: base,

  blush: {
    ...base,
    accent: "#C4707A",
    mainBg: "#FDF5F5",
    altBg: "#FAF0F0",
    text: "#2D1A20",
    subText: "#8B6070",
    heroBg: "linear-gradient(160deg, #E8C4C4 0%, #F5D5D5 40%, #EDE0D0 100%)",
    heroOverlay: "rgba(45,26,32,0.42)",
    countdownBg: "#FAF0F0",
    schedulePhotoBg: "#2D1A20",
    footerColor: "#C4A0A0",
    buttonRadius: "9999px",
    ornament: "♡",
  },

  "azul-marinho": {
    ...base,
    accent: "#1B3A5C",
    mainBg: "#F4F7FA",
    altBg: "#E8EEF5",
    text: "#0D1B2A",
    subText: "#4A6080",
    heroBg: "linear-gradient(135deg, #0D1B2A 0%, #1B3A5C 100%)",
    heroOverlay: "rgba(13,27,42,0.45)",
    countdownBg: "#E8EEF5",
    schedulePhotoBg: "#0D1B2A",
    footerColor: "#4A6080",
    buttonRadius: "0.25rem",
  },

  terracota: {
    ...base,
    accent: "#C4704A",
    mainBg: "#F5EDE0",
    altBg: "#EDE0CC",
    text: "#2D1A10",
    subText: "#6B4A30",
    heroBg: "linear-gradient(160deg, #4A3728 0%, #C4704A 60%, #E8A070 100%)",
    heroOverlay: "rgba(30,15,5,0.45)",
    countdownBg: "#EDE0CC",
    schedulePhotoBg: "#2D1A10",
    footerColor: "#8B6840",
    buttonRadius: "2px",
    ornament: "✦",
  },

  lavanda: {
    ...base,
    accent: "#7B6BA8",
    mainBg: "#F8F6FC",
    altBg: "#EEE8F8",
    text: "#1E1830",
    subText: "#6B5A85",
    heroBg: "linear-gradient(135deg, #3D2B6B 0%, #7B6BA8 100%)",
    heroOverlay: "rgba(30,24,48,0.42)",
    countdownBg: "#EEE8F8",
    schedulePhotoBg: "#1E1830",
    footerColor: "#9B8BC0",
    buttonRadius: "9999px",
    ornament: "✿",
  },
};

export function getPaletteTheme(palette: string | null | undefined): PaletteTheme {
  if (!palette) return PALETTE_THEMES.sage;

  // custom|#hex1|#hex2|#hex3
  if (palette.startsWith("custom|")) {
    const parts = palette.split("|");
    const accent = parts[1] ?? "#7A8C6A";
    const bg = parts[2] ?? "#F5F0E8";
    const altBg = parts[3] ?? "#EDE4D0";
    return {
      ...base,
      accent,
      mainBg: bg,
      altBg,
      heroBg: `linear-gradient(135deg, ${accent}88 0%, ${accent} 100%)`,
      countdownBg: altBg,
      schedulePhotoBg: "#1C2018",
      footerColor: accent + "99",
    };
  }

  return PALETTE_THEMES[palette] ?? PALETTE_THEMES.sage;
}
