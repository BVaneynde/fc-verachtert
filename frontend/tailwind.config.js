/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      // Transport Verachtert colors
      'fcred': '#C41E3A',
      'fcwhite': '#FFFFFF',
      'fcredlight': '#E84856',
      'fcrefdark': '#8B1528',
      // Include default Tailwind colors too
      'white': '#FFFFFF',
      'gray': {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
      'red': {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        600: '#DC2626',
        700: '#B91C1C',
      }
    }
  },
  plugins: [],
}
