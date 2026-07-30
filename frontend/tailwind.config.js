/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080C",
          900: "#0A0C11",
          850: "#0E1019",
          800: "#131620",
          700: "#191D2A",
          600: "#222737",
          500: "#2F3549",
        },
        mist: {
          100: "#EDEEF2",
          300: "#C7CAD6",
          500: "#9498A6",
          700: "#6A6E7D",
        },
        // Amber-gold primary accent — warm, premium, not blue/purple/pink
        signal: {
          400: "#F0BE60",
          500: "#E8A838",
          600: "#C88C1A",
          700: "#9E6B0D",
        },
        // Teal secondary
        vector: {
          400: "#7EE9D6",
          500: "#58D9C4",
          600: "#3BB8A4",
        },
        // Citation gold
        citation: {
          300: "#FBD48C",
          400: "#F5B94D",
          500: "#E0A030",
        },
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        // Amber-gold + teal aurora — no blue
        aurora:
          "radial-gradient(circle at 15% 25%, rgba(232,168,56,0.18), transparent 42%), radial-gradient(circle at 82% 5%, rgba(88,217,196,0.13), transparent 45%), radial-gradient(circle at 50% 95%, rgba(232,168,56,0.10), transparent 40%), radial-gradient(circle at 70% 60%, rgba(58,184,164,0.06), transparent 35%)",
      },
      boxShadow: {
        glass:
          "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 8px 30px rgba(0,0,0,0.40)",
        glow: "0 0 0 1px rgba(232,168,56,0.45), 0 0 48px rgba(232,168,56,0.22)",
        "glow-teal":
          "0 0 0 1px rgba(88,217,196,0.4), 0 0 40px rgba(88,217,196,0.18)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseDot: {
          "0%, 100%": { opacity: 0.4, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.4)" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: 0, transform: "translateX(-12px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        countUp: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        fadeUp: "fadeUp 0.5s ease forwards",
        slideIn: "slideIn 0.4s ease forwards",
        shake: "shake 0.4s ease",
        countUp: "countUp 0.5s ease forwards",
      },
    },
  },
  plugins: [],
};
