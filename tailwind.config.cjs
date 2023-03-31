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
        animation: {
          wiggle: "wiggle 1s ease-in-out infinite",
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;
