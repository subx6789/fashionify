/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ── Typography tokens ──────────────────────────────────────────────────
      fontFamily: {
        // Centralized font tokens — change here to update entire app
        sans:    ["Space Grotesk", "system-ui", "sans-serif"],
        heading: ["Space Grotesk", "system-ui", "sans-serif"],
        body:    ["Space Grotesk", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono:    ["Space Mono", "monospace"],
      },
      // ── Color tokens ───────────────────────────────────────────────────────
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover:      "hsl(var(--primary-hover))",
          soft:       "hsl(var(--primary-soft))",
          dark:       "hsl(var(--primary-dark))",
          contrast:   "hsl(var(--primary-contrast))",
          surface:    "hsl(var(--primary-surface))",
          border:     "hsl(var(--primary-border))",
          glow:       "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          hover:      "hsl(var(--secondary-hover))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Design tokens — Neubrutalism palette
        neu: {
          black:    "hsl(var(--neu-black))",
          white:    "hsl(var(--neu-white))",
          yellow:   "hsl(var(--neu-yellow))",
          pink:     "hsl(var(--neu-pink))",
          blue:     "hsl(var(--neu-blue))",
          green:    "hsl(var(--neu-green))",
          orange:   "hsl(var(--neu-orange))",
        },
      },
      // ── Spacing ────────────────────────────────────────────────────────────
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        neu: "0px",   // Neubrutalism sharp corners
      },
      // ── Box shadows — Neubrutalism layered shadows ─────────────────────────
      boxShadow: {
        "neu":     "4px 4px 0px 0px hsl(var(--neu-black))",
        "neu-sm":  "2px 2px 0px 0px hsl(var(--neu-black))",
        "neu-lg":  "6px 6px 0px 0px hsl(var(--neu-black))",
        "neu-xl":  "8px 8px 0px 0px hsl(var(--neu-black))",
        "neu-hover": "2px 2px 0px 0px hsl(var(--neu-black))",
        "neu-color": "4px 4px 0px 0px hsl(var(--primary))",
      },
      // ── Keyframes ──────────────────────────────────────────────────────────
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "modal-in": {
          from: { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          to:   { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "slide-up":       "slide-up 0.3s ease-out",
        "fade-in":        "fade-in 0.2s ease-out",
        "modal-in":       "modal-in 0.25s cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};