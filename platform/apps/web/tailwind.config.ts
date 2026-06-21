import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          green: {
            950: "#021A0D",
            900: "#052A16",
            800: "#0A4424",
            700: "#135A30",
          },
          gold: {
            300: "#F0CC8D",
            400: "#DDB56C",
            500: "#C79A4E",
            600: "#A87B38",
          },
          ivory: {
            50:  "#FAF6EC",
            100: "#F4F1E5",
            200: "#F3E8D2",
          },
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body:    ["Work Sans", "system-ui", "sans-serif"],
        script:  ["Mrs Saint Delafield", "cursive"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
      },
    },
  },
  plugins: [],
};

export default config;
