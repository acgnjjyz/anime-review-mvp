import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    borderRadius: {
      none: "0",
      DEFAULT: "0",
      sm: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      "3xl": "0",
      full: "0",
    },
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        "canvas-muted": "rgb(var(--color-canvas-muted) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        raised: "rgb(var(--color-raised) / <alpha-value>)",
        field: "rgb(var(--color-field) / <alpha-value>)",
        chrome: "rgb(var(--color-chrome) / <alpha-value>)",
        popover: "rgb(var(--color-popover) / <alpha-value>)",
        wash: "rgb(var(--color-wash) / <alpha-value>)",
        depth: "rgb(var(--color-depth) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        stroke: "rgb(var(--color-stroke) / <alpha-value>)",
        heading: "rgb(var(--color-heading) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        "cyan-ink": "rgb(var(--color-cyan-ink) / <alpha-value>)",
        "sky-ink": "rgb(var(--color-sky-ink) / <alpha-value>)",
        "violet-ink": "rgb(var(--color-violet-ink) / <alpha-value>)",
        "amber-ink": "rgb(var(--color-amber-ink) / <alpha-value>)",
        "red-ink": "rgb(var(--color-red-ink) / <alpha-value>)",
        "rose-ink": "rgb(var(--color-rose-ink) / <alpha-value>)",
        "emerald-ink": "rgb(var(--color-emerald-ink) / <alpha-value>)",
        ink: "#18212f",
        paper: "#f8fafc",
        coral: "#e85d75",
        mint: "#2a9d8f",
        honey: "#f4a261",
      },
      boxShadow: {
        soft: "0 14px 40px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
