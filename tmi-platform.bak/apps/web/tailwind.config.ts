import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#FF2DAA',
          blue: '#2DAAFF',
          purple: '#AA2DFF',
          green: '#2DFFAA',
          yellow: '#FFAA2D',
        },
        dark: {
          900: '#0A0A0F',
          800: '#131318',
          700: '#1C1C24',
        },
      },
      fontFamily: {
        vcr: ['"VCR OSD Mono"', 'monospace'],
        neon: ['"Audiowide"', 'cursive'],
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'slide-in': 'slide-in 0.5s ease-out',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { textShadow: '0 0 10px #FF2DAA, 0 0 20px #FF2DAA, 0 0 30px #FF2DAA' },
          '50%': { textShadow: '0 0 5px #FF2DAA, 0 0 10px #FF2DAA, 0 0 15px #FF2DAA' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px #FF2DAA, 0 0 10px #FF2DAA' },
          '100%': { boxShadow: '0 0 20px #FF2DAA, 0 0 30px #FF2DAA, 0 0 40px #FF2DAA' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
