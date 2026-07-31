/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Transport Verachtert colors
        'fcred': '#C41E3A',
        'fcwhite': '#FFFFFF',
        'fcredlight': '#E84856',
        'fcrefdark': '#8B1528',
      },
      backgroundImage: {
        'stripe-red': 'repeating-linear-gradient(45deg, #C41E3A, #C41E3A 20px, #FFFFFF 20px, #FFFFFF 40px)',
      }
    },
  },
  plugins: [],
}
