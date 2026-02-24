/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gold': '#ffd700',
        'gold-dark': '#b8860b',
        'rpg-black': '#0a0a0a',
        'rpg-dark': '#1a1a1a',
        'rpg-accent': '#2a2a2a',
      },
      fontFamily: {
        'fantasy': ['Cinzel', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
