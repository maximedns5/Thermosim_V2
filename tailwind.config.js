/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper:   '#F4F2ED',
        ink:     '#0A0A0A',
        'ink-2': '#2B2B2B',
        'ink-3': '#6B6B6B',
        accent:  '#C1440E',
        rule:    '#C8C5BE',
        'rule-soft': '#E2DFD8',
      },
      fontFamily: {
        mono:  ['IBM Plex Mono', 'ui-monospace', 'monospace'],
        sans:  ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        serif: ['IBM Plex Serif', 'ui-serif', 'serif'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
}

