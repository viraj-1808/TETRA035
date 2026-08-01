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
          sidebar: "#F3EEE5",
          mapCard: "#E8E2D5",
        },
        text: {
          primary: "#2D2A26",
          secondary: "#1A1815",
          muted: "#8A8580",
          map: "#1C2B17",
          mapMuted: "#68785E",
        },
        border: {
          DEFAULT: "#C4BDB0",
          map: "#D8D0C0",
        },
      },
    },
  },
  plugins: [],
};