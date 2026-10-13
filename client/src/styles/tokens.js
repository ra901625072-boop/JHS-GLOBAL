/**
 * Export B2B Design Tokens
 * 
 * Strict 3-Brand-Color Philosophy:
 * 1. Primary: Deep Forest Green (Stability, agriculture, international trade security)
 * 2. Accent: Muted Champagne Gold (Premium ingredient quality, sparing highlights)
 * 3. CTA: International Amber Gold (High-contrast conversion for Request a Quote)
 * 
 * Surfaces & Typography: Soft off-white canvas, crisp white cards, neutral charcoal body.
 */

export const colors = {
  // Brand 1: Forest Green (Primary)
  primary: {
    50: '#F2F7F4',
    100: '#E1EDE6',
    200: '#C2DBCB',
    300: '#94C0A4',
    400: '#61A079',
    500: '#3D8157',
    600: '#2A6441',
    700: '#1D4D31',
    800: '#0D2818', // Core Brand Primary
    850: '#082214',
    900: '#0B201A',
    950: '#05140B', // Deepest Brand Forest Green
  },

  // Brand 2: Muted Gold (Accent highlights)
  accent: {
    50: '#FDFBF7',
    100: '#F8F4EC',
    200: '#EDE2D0',
    300: '#DFCCAB',
    400: '#D2B684',
    500: '#C5A059', // Core Brand Accent
    600: '#9E7D3B',
    700: '#7B5E28',
    800: '#5A431A',
    900: '#3D2C10',
  },

  // Brand 3: Amber Gold (High-contrast Action / CTA)
  cta: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#D97706', // Primary "Request a Quote" Action
    600: '#B45309',
    700: '#92400E',
    800: '#78350F',
    900: '#451A03',
  },

  // Surfaces & Backgrounds
  surface: {
    canvas: '#FBFBF9', // Soft off-white
    card: '#FFFFFF',   // Pure clean white
    subtle: '#F4F4F0', // Neutral section background
    border: '#E5E7EB', // Subtle hairline border
  },

  // Charcoal Typography (WCAG AAA compliant on white & off-white)
  neutral: {
    900: '#111827', // Charcoal headings
    800: '#1F2937', // Heavy body text
    700: '#374151', // Default body text
    600: '#4B5563', // Secondary text
    500: '#6B7280', // Muted captions & metadata
    400: '#9CA3AF',
    300: '#D1D5DB',
    200: '#E5E7EB',
    100: '#F3F4F6',
    50: '#F9FAFB',
  },

  // Status & Feedback
  status: {
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
  },
};

export const typography = {
  fontFamily: {
    serif: ['Playfair Display', 'Georgia', 'serif'],
    sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
  },
};

export const spacing = {
  container: '1280px',
  article: '800px',
  touchTarget: '44px',
};

export default {
  colors,
  typography,
  spacing,
};
