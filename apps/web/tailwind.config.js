/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dalia: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#E3007E', // INE Pink
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        brand: {
          dark: '#0B132B',
          navy: '#1C2541', // Deep Navy from Wireframe
          blue: '#3A506B',
          light: '#5BC0BE',
          green: '#20A4F3',
          success: '#10b981', // green for indicator
        },
        background: '#FAFAFA', // Light grey/white
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
