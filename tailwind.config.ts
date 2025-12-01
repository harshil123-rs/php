import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        foreground: "#f9fafb",
        card: "#020817",
        "card-border": "#1f2937",
        accent: "#22c55e",
        muted: "#6b7280",
        danger: "#ef4444"
      },
      boxShadow: {
        glass: "0 20px 45px rgba(15,23,42,0.9)"
      },
      borderRadius: {
        xl: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;


