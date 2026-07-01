export interface TemplateConfig {
  name1: string;
  name2: string;
  heroTitle: string;
  heroSubtitle: string | null;
  aboutText: string | null;
  coverPhotoUrl: string | null;
  weddingDate: string | null;
  weddingLocation: string | null;
  showGifts: boolean;
  showRsvp: boolean;
  showAbout: boolean;
  dresscode: string | null;
  schedule: string | null;
  directions: string | null;
  directionsUrl: string | null;
  showDresscode: boolean;
  showSchedule: boolean;
  showDirections: boolean;
  showMessages: boolean;
  sectionOrder: string[];
  palette: string | null;
  translationsEnabled: boolean;
  translationLanguages: string[];
  typography: string | null;
  // Títulos customizáveis por seção
  aboutTitle: string;
  rsvpTitle: string;
  giftsTitle: string;
  dresscodeTitle: string;
  scheduleTitle: string;
  directionsTitle: string;
  messagesTitle: string;
  // Subtítulos e foto por seção
  aboutPhotoUrl: string | null;
  aboutSubtitle: string | null;
  rsvpSubtitle: string | null;
  rsvpText: string | null;
  giftsText: string | null;
  directionsSubtitle: string | null;
  // Prévia de presentes para seção no site
  giftsPreview: { id: string; name: string; description: string | null; amount: number | null; photo_url: string | null; category: string | null }[];
}

export interface TemplateProps {
  couple: { id: string; slug: string };
  config: TemplateConfig;
  slug: string;
}
