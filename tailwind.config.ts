import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      /* Surfaces */
      paper:           '#F2EFE8',
      'paper-alt':     '#EDEBE4',
      surface:         '#F7F5F0',
      'surface-2':     '#FAFAF8',
      'surface-dark':  '#0A0D12',
      'surface-panel': '#EDEBE4',
      /* Texte */
      ink:       '#0D0D0D',
      'ink-2':   '#2A2A2A',
      'ink-3':   '#6B6B6B',
      'ink-4':   '#A8A5A0',
      'ink-inv': '#E8E4DA',
      /* Accent primaire */
      'accent-primary': '#1A3550',
      'accent-glow':    'rgba(26,53,80,0.12)',
      /* Accent secondaire */
      accent:       '#C1440E',
      'accent-soft':'rgba(193,68,14,0.10)',
      /* Accent énergie */
      energy:       '#0B7A63',
      'energy-soft':'rgba(11,122,99,0.10)',
      /* Filets */
      rule:         '#C8C5BE',
      'rule-soft':  '#E2DFD8',
      white:  '#FFFFFF',
      black:  '#000000',
    },
    fontFamily: {
      display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      mono:    ['"IBM Plex Mono"', 'monospace'],
      sans:    ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      serif:   ['"IBM Plex Serif"', 'serif'],
    },
    fontSize: {
      '2xs': ['9px',  { lineHeight: '14px' }],
      xs:    ['10px', { lineHeight: '14px' }],
      sm:    ['11px', { lineHeight: '16px' }],
      base:  ['12px', { lineHeight: '18px' }],
      md:    ['13px', { lineHeight: '20px' }],
      lg:    ['16px', { lineHeight: '22px' }],
      xl:    ['22px', { lineHeight: '28px' }],
      '2xl': ['28px', { lineHeight: '32px' }],
      '3xl': ['36px', { lineHeight: '40px' }],
    },
    borderRadius: {
      DEFAULT: '0',
      sm: '2px',
      md: '3px',
    },
    extend: {
      spacing: { '0.5': '2px' },
    },
  },
  plugins: [],
} satisfies Config;
