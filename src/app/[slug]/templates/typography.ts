export interface TypographyPairing {
  label: string;
  desc: string;
  displayFont: string;
  bodyFont: string;
  displayStyle: string; // CSS font-family string for inline preview
  bodyStyle: string;
  googleUrl: string | null; // null = usa fonts padrão do app
}

export const TYPOGRAPHY_PAIRINGS: Record<string, TypographyPairing> = {
  default: {
    label: "Padrão",
    desc: "Bricolage + Inter",
    displayFont: "Bricolage Grotesque",
    bodyFont: "Inter",
    displayStyle: "'Bricolage Grotesque', sans-serif",
    bodyStyle: "'Inter', sans-serif",
    googleUrl: null, // usa as fonts já carregadas no layout.tsx
  },
  classico: {
    label: "Clássico",
    desc: "Playfair + Lato",
    displayFont: "Playfair Display",
    bodyFont: "Lato",
    displayStyle: "'Playfair Display', serif",
    bodyStyle: "'Lato', sans-serif",
    googleUrl:
      "family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lato:wght@300;400;700",
  },
  romantico: {
    label: "Romântico",
    desc: "Cormorant + Raleway",
    displayFont: "Cormorant Garamond",
    bodyFont: "Raleway",
    displayStyle: "'Cormorant Garamond', serif",
    bodyStyle: "'Raleway', sans-serif",
    googleUrl:
      "family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Raleway:wght@300;400;600",
  },
  editorial: {
    label: "Editorial",
    desc: "DM Serif + DM Sans",
    displayFont: "DM Serif Display",
    bodyFont: "DM Sans",
    displayStyle: "'DM Serif Display', serif",
    bodyStyle: "'DM Sans', sans-serif",
    googleUrl:
      "family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500",
  },
  moderno: {
    label: "Moderno",
    desc: "Montserrat + Inter",
    displayFont: "Montserrat",
    bodyFont: "Inter",
    displayStyle: "'Montserrat', sans-serif",
    bodyStyle: "'Inter', sans-serif",
    googleUrl: "family=Montserrat:wght@400;600;700",
  },
  jardim: {
    label: "Jardim",
    desc: "Libre Baskerville + Nunito",
    displayFont: "Libre Baskerville",
    bodyFont: "Nunito",
    displayStyle: "'Libre Baskerville', serif",
    bodyStyle: "'Nunito', sans-serif",
    googleUrl:
      "family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;600",
  },
};

export function getTypographyPairing(key: string | null | undefined): TypographyPairing {
  return TYPOGRAPHY_PAIRINGS[key ?? "default"] ?? TYPOGRAPHY_PAIRINGS.default;
}
