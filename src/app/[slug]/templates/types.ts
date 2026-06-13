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
}

export interface TemplateProps {
  couple: { id: string; slug: string };
  config: TemplateConfig;
  slug: string;
}
