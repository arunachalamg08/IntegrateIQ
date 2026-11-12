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
          950: '#070A0F', // Ultra deep background
          900: '#0B0F17', // Main app background
          850: '#0F1623', // Elevated canvas
          800: '#141D2E', // Card surface
          750: '#1A253A', // Hover surface
          700: '#22304A', // Borders & dividers
          600: '#334466', // Subtle outlines
        },
        electric: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Electric blue primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        verified: {
          500: '#10b981',
          400: '#34d399',
          900: '#064e3b',
        },
        simulated: {
          amber: '#f59e0b',
          red: '#ef4444',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
