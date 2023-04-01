/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        washover: {
          "0%": { transform: "translateX(-10%)", opacity: "0" },
          "20%": { transform: "translateX(0)", opacity: "1" },
          "80%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(10%)", opacity: "0" },
        },
      },
      animation: {
        wiggle: "wiggle 1s ease-in-out infinite",
        washover: "washover 3s ease-in-out",
        "spin-slow": "spin 9s linear infinite",
      },
      colors: {
        "default-text": "#fff",
        "page-background": "#18181b",
      },
    },
  },
  plugins: [],
};

module.exports = config;
