/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d9ff',
          300: '#a5bfff',
          400: '#7c9cff',
          500: '#5b78f6',
          600: '#4560eb',
          700: '#3a4fd6',
          800: '#3242ac',
          900: '#2d3a88',
          950: '#1e2557',
        },
        surface: {
          DEFAULT:  '#ffffff',
          muted:    '#f8f9fc',
          subtle:   '#f1f3f9',
          border:   'rgba(15,23,42,0.08)',
          'border-strong': 'rgba(15,23,42,0.14)',
        },
      },
      animation: {
        'in':         'fadeSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'in-fast':    'fadeSlideUp 0.18s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) both',
        'spin-slow':  'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':    'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition:  '400px 0' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'xs':          '0 1px 2px rgba(15,23,42,0.05)',
        'sm':          '0 2px 4px rgba(15,23,42,0.06)',
        'md':          '0 4px 12px rgba(15,23,42,0.08)',
        'lg':          '0 8px 24px rgba(15,23,42,0.10)',
        'xl':          '0 16px 48px rgba(15,23,42,0.12)',
        'inner-sm':    'inset 0 1px 2px rgba(0,0,0,0.05)',
        'glow-brand':  '0 0 20px rgba(91,120,246,0.25)',
        'card':        '0 2px 8px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.06)',
        'card-hover':  '0 8px 24px rgba(15,23,42,0.10), 0 0 0 1px rgba(15,23,42,0.08)',
        'input-focus': '0 0 0 3px rgba(91,120,246,0.18)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-gradient':  'linear-gradient(135deg, #4560eb 0%, #7c3aed 100%)',
        'surface-gradient':'linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%)',
      },
      screens: {
        'xs': '375px',
      },
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
};
