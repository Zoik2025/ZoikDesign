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
        zoik: {
          dark: '#121214',      // Gris profundo de fondo
          panel: '#18181b',     // Gris de paneles tipo Illustrator
          card: '#202024',      // Gris de tarjetas
          border: '#27272a',    // Bordes neutros
          purple: '#a855f7',    // Línea púrpura de acento
          purpleDark: '#7e22ce',
          white: '#ffffff',
          zincMuted: '#3f3f46',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
