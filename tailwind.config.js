/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f68e4c',
          dark: '#e5782e',
          light: '#fff5ee',
          50: '#fff8f1',
          100: '#fff0e0',
          200: '#ffdbb8',
          300: '#ffc08a',
          400: '#f68e4c',
          500: '#f07a30',
          600: '#e5782e',
          700: '#c05e1f',
          800: '#9a4b1e',
          900: '#7e3f1c',
        },
        accent: {
          DEFAULT: '#26af61',
          dark: '#1e9450',
          light: '#edfbf2',
          50: '#f0fdf5',
          100: '#dcfce8',
          200: '#bbf7d1',
          300: '#86efad',
          400: '#4ade80',
          500: '#26af61',
          600: '#1e9450',
          700: '#15803d',
        },
        sidebar: '#ffffff',
        body: '#f5f5f5',
        dark: '#1a1a2e',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
