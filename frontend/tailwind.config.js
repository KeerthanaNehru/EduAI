/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        edu: {
          primary: '#a855f7',
          secondary: '#7c3aed',
          accent: '#c084fc',
          glow: '#e879f9',
          dark: '#050508',
          card: '#0d0d1a',
          border: '#1e1030',
          text: '#e2e8f0',
          subtext: '#94a3b8',
        }
      },
    },
  },
  plugins: [],
}
