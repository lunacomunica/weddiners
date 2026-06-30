import { getTypographyPairing } from "./templates/typography";

export function FontInjector({ typography }: { typography: string | null }) {
  const p = getTypographyPairing(typography);
  if (!p.googleUrl) return null; // usa fonts padrão do layout.tsx

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href={`https://fonts.googleapis.com/css2?${p.googleUrl}&display=swap`}
        rel="stylesheet"
      />
      <style>{`
        html, body, :root {
          --font-display: ${p.displayStyle} !important;
          --font-body: ${p.bodyStyle} !important;
        }
      `}</style>
    </>
  );
}
