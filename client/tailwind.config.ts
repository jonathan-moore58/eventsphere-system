import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          violet: '#7C3AED',
          magenta: '#EC4899',
          cyan: '#06B6D4',
          dark: '#050508',
          surface: 'rgba(255,255,255,0.04)',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #06B6D4 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.05))',
      },
      boxShadow: {
        'glow-violet': '0 0 30px rgba(124,58,237,0.3)',
        'glow-cyan': '0 0 30px rgba(6,182,212,0.3)',
        'card': '0 4px 40px rgba(0,0,0,0.4)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'counter': 'counter 1s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124,58,237,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(124,58,237,0.6)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
