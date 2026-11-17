/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          500: '#1e4b82',
          600: '#173c6b',
          700: '#112c50',
          800: '#0d213c',
          900: '#081527',
        }
      }
    },
  },
  plugins: [],
}
