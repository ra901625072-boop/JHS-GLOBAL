import { colors, typography } from './src/styles/tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        accent: colors.accent,
        cta: colors.cta,
        surface: colors.surface,
        neutral: colors.neutral,
        status: colors.status,
      },
      fontFamily: {
        serif: typography.fontFamily.serif,
        sans: typography.fontFamily.sans,
        mono: typography.fontFamily.mono,
      },
      minHeight: {
        tap: '44px',
      },
      minWidth: {
        tap: '44px',
      },
      borderRadius: {
        /* Admin radius tokens — also usable via CSS vars */
        'admin-sm': '4px',
        'admin-md': '6px',
        'admin-lg': '8px',
        'admin-xl': '12px',
      },
      boxShadow: {
        /* Public site shadows (preserved) */
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        hover: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        /* Admin-scoped shadows */
        'admin-raised': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'admin-overlay': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1.4' }],
      },
      maxWidth: {
        'admin-content': '1440px',
      },
    },
  },
  plugins: [],
};
