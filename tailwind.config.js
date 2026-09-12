/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Page-chrome tokens: swap with the light/dark data-theme attribute (see index.css).
        // Card-face tokens (paper*, ink.900, accent*) stay constant across themes by design —
        // the "paper card" surface never changes, only the room around it does.
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          900: "#0a0a0b",
          raised: "rgb(var(--c-ink-raised) / <alpha-value>)",
          overlay: "rgba(10,10,11,0.78)",
        },
        paper: {
          DEFAULT: "#f4f0e6",
          dim: "#e9e3d2",
          line: "rgba(19,19,17,0.12)",
          faint: "rgba(19,19,17,0.06)",
        },
        line: "rgb(var(--c-line) / <alpha-value>)",
        "line-strong": "rgb(var(--c-line-strong) / <alpha-value>)",
        "paper-line": "rgba(19,19,17,0.12)",
        accent: {
          DEFAULT: "#ff5a1f",
          ink: "#1a0800",
          soft: "rgba(255,90,31,0.16)",
          dim: "#d94a17",
          deep: "#9c330f",
          // Adaptive variant for accent text/icons sitting directly on page chrome —
          // vivid orange reads fine on the dark page but fails contrast on the light one.
          fg: "rgb(var(--c-accent-fg) / <alpha-value>)",
        },
        stone: "#8a93a6",
        jade: "#3fa796",
        text: {
          DEFAULT: "rgb(var(--c-text) / <alpha-value>)",
          muted: "rgb(var(--c-text-muted) / <alpha-value>)",
          faint: "#6b675c",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "serif"],
        sans: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        pill: "999px",
      },
      boxShadow: {
        card: "3px 3px 0 0 rgba(10,10,11,0.9)",
        "card-lg": "6px 6px 0 0 rgba(10,10,11,0.9)",
        "card-hover": "5px 5px 0 0 rgba(10,10,11,0.9)",
        "card-dark": "3px 3px 0 0 rgba(244,240,230,0.18)",
        panel: "-8px 0 0 0 rgba(10,10,11,0.9)",
        focus: "0 0 0 3px rgba(255,90,31,0.5)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "pop-in": {
          from: { opacity: "0", transform: "scale(0.96) translateY(6px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out both",
        "rise-in": "rise-in 0.45s cubic-bezier(0.2,0.8,0.2,1) both",
        "slide-in-right": "slide-in-right 0.32s cubic-bezier(0.2,0.8,0.2,1) both",
        "pop-in": "pop-in 0.22s cubic-bezier(0.2,0.8,0.2,1) both",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.2,0.8,0.2,1)",
      },
    },
  },
  plugins: [],
}
