export type ReferenceCategory = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bg: string;
};

export type Reference = {
  id: string;
  category: string;
  imageUrl: string;
  note?: string;
  sourceUrl?: string;
  sourceType?: "pinterest" | "instagram" | "upload" | "link";
  createdAt: string;
};

export const REFERENCE_CATEGORIES: ReferenceCategory[] = [
  { id: "vestido",    label: "Vestido",      emoji: "👗", color: "#C4707A", bg: "#FDF3F4" },
  { id: "decoracao",  label: "Decoração",    emoji: "✨", color: "#7A8C6A", bg: "#F0F4ED" },
  { id: "flores",     label: "Flores",       emoji: "💐", color: "#5A7A6A", bg: "#EDF4F0" },
  { id: "bolo",       label: "Bolo",         emoji: "🎂", color: "#C4704A", bg: "#FAF0EA" },
  { id: "penteado",   label: "Penteado",     emoji: "💇", color: "#A0729A", bg: "#F8F3F8" },
  { id: "maquiagem",  label: "Maquiagem",    emoji: "💄", color: "#B06080", bg: "#FDF0F5" },
  { id: "convite",    label: "Convite",      emoji: "✉️", color: "#1B3A5C", bg: "#EEF3F8" },
  { id: "mesa",       label: "Mesa posta",   emoji: "🍽️", color: "#7B6BA8", bg: "#F5F3FB" },
  { id: "cerimonia",  label: "Cerimônia",    emoji: "💒", color: "#8C7A5A", bg: "#F7F3ED" },
  { id: "outros",     label: "Outros",       emoji: "📌", color: "#8C8C8C", bg: "#F5F5F5" },
];

// Imagens fake de placeholder para visualização do design
export const FAKE_REFERENCES: Reference[] = [
  {
    id: "1",
    category: "vestido",
    imageUrl: "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=400&q=80",
    note: "Adoro o decote e a cauda longa",
    sourceType: "pinterest",
    sourceUrl: "https://pinterest.com",
    createdAt: "2026-01-10",
  },
  {
    id: "2",
    category: "decoracao",
    imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80",
    note: "Paleta de cores: verde sage + champagne",
    sourceType: "instagram",
    createdAt: "2026-01-12",
  },
  {
    id: "3",
    category: "flores",
    imageUrl: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=400&q=80",
    note: "Buquê com peônias e eucalipto",
    sourceType: "pinterest",
    createdAt: "2026-01-15",
  },
  {
    id: "4",
    category: "bolo",
    imageUrl: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400&q=80",
    note: "Naked cake com flores naturais",
    sourceType: "instagram",
    createdAt: "2026-01-18",
  },
  {
    id: "5",
    category: "decoracao",
    imageUrl: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400&q=80",
    sourceType: "upload",
    createdAt: "2026-01-20",
  },
  {
    id: "6",
    category: "penteado",
    imageUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400&q=80",
    note: "Coque baixo com flores",
    sourceType: "pinterest",
    createdAt: "2026-01-22",
  },
  {
    id: "7",
    category: "mesa",
    imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80",
    note: "Mesa com velas e flores baixas",
    sourceType: "instagram",
    createdAt: "2026-01-25",
  },
  {
    id: "8",
    category: "cerimonia",
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=80",
    note: "Altar com arco floral",
    sourceType: "pinterest",
    createdAt: "2026-01-28",
  },
  {
    id: "9",
    category: "vestido",
    imageUrl: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=400&q=80",
    note: "Referência de manga",
    sourceType: "upload",
    createdAt: "2026-02-01",
  },
  {
    id: "10",
    category: "convite",
    imageUrl: "https://images.unsplash.com/photo-1607469256872-29746e69b16e?w=400&q=80",
    note: "Convite minimalista com folha dourada",
    sourceType: "pinterest",
    createdAt: "2026-02-03",
  },
  {
    id: "11",
    category: "maquiagem",
    imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80",
    note: "Make iluminada e natural",
    sourceType: "instagram",
    createdAt: "2026-02-05",
  },
  {
    id: "12",
    category: "flores",
    imageUrl: "https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=400&q=80",
    note: "Decoração de mesa com flores soltas",
    sourceType: "upload",
    createdAt: "2026-02-08",
  },
];
