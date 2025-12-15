// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // CRUCIAL for React files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}