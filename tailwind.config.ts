import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#040608",
          900: "#07090e",
          800: "#0f131a",
          700: "#141822",
          600: "#1c2230",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "gold-glow": "0 0 25px -5px rgba(245, 158, 11, 0.25)",
        "cyan-glow": "0 0 25px -5px rgba(6, 182, 212, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
