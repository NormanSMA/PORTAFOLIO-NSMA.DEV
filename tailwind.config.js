/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0A0F',
          card: '#1A1A24',
          border: '#2A2A34',
        },
        light: {
          bg: '#FFFFFF',
          card: '#F9FAFB',
          border: '#E5E7EB',
        },
      },
      fontFamily: {
        mono: ['Roboto Mono', 'monospace'],
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
