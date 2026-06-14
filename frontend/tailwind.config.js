/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Required for @apply border-border in globals.css
        border: "#2d3154",
        input:  "#2d3154",
        ring:   "#6366f1",
        // Tata Steel industrial palette
        steel: {
          50:  "#f0f4ff",
          100: "#e0e8ff",
          200: "#c7d4fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        forge: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        // Dark theme grays
        surface: {
          DEFAULT: "#0f1117",
          50:  "#1a1d2e",
          100: "#161927",
          200: "#121520",
          300: "#0e1119",
          400: "#0b0d14",
        },
        card: {
          DEFAULT: "#1a1d2e",
          hover:   "#1f2340",
          border:  "#2d3154",
        },
        muted: {
          DEFAULT: "#6b7280",
          foreground: "#9ca3af",
        },
        accent: {
          blue:   "#3b82f6",
          green:  "#10b981",
          amber:  "#f59e0b",
          red:    "#ef4444",
          purple: "#8b5cf6",
          cyan:   "#06b6d4",
        },
      },
      fontFamily: {
        sans:  ["Inter", "system-ui", "sans-serif"],
        mono:  ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-steel": "linear-gradient(135deg, #1e1b4b 0%, #0f1117 50%, #1a0a00 100%)",
        "gradient-card":  "linear-gradient(145deg, #1f2340 0%, #161927 100%)",
        "gradient-glow":  "radial-gradient(ellipse at top, #4f46e520 0%, transparent 60%)",
      },
      animation: {
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up":    "slideUp 0.3s ease-out",
        "fade-in":     "fadeIn 0.4s ease-out",
        "glow":        "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        slideUp:  { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        glow:     { from: { boxShadow: "0 0 5px #6366f140" }, to: { boxShadow: "0 0 20px #6366f160" } },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
