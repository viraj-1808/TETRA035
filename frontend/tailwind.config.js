/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          mint: "#9bf09d",
          green: "#5DB85D",
          light: "#A8DFA8",
        },
        surface: {
          page: "#F5F0E8",
          card: "#EDE8DD",
          header: "#D4CBB8",
        },
        text: {
          primary: "#2D2A26",
          secondary: "#1A1815",
          muted: "#8A8580",
        },
        border: {
          DEFAULT: "#C4BDB0",
        },
      },
    },
  },
  plugins: [],
};