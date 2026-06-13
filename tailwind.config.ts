import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        noir:         "#1C2018",
        gold:         "#7A8C6A",
        "gold-light": "#A8B898",
        champagne:    "#EDE4D0",
        blush:        "#D4C8A8",
        rose:         "#A0435A",
        ivory:        "#FAF8F4",
        smoke:        "#7A7860",
        moss:         "#3A4A30",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body:    ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        sm:   "8px",
        md:   "16px",
        lg:   "24px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
