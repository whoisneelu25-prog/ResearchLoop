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
          50: '#EFF4FE',
          100: '#D9E6FE',
          200: '#BBD2FD',
          300: '#8FB5FC',
          400: '#5C90FA',
          500: '#155EEF', // Primary Deep Medical Blue
          600: '#0F48BD',
          700: '#0A348C',
          800: '#072461',
          900: '#051842',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        evidence: {
          positive: '#15803D',
          positiveBg: '#F0FDF4',
          positiveBorder: '#BBF7D0',
          negative: '#B91C1C',
          negativeBg: '#FEF2F2',
          negativeBorder: '#FECACA',
          mixed: '#B45309',
          mixedBg: '#FFFBEB',
          mixedBorder: '#FDE68A',
          inconclusive: '#475569',
          inconclusiveBg: '#F8FAFC',
          inconclusiveBorder: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
