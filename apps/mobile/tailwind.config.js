/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#FAF7F2', dark: '#0F0E0C' },
        surface: { DEFAULT: '#FFFFFF', dark: '#1A1815' },
        ink: { DEFAULT: '#1A1A1A', dark: '#F5F1EA' },
        muted: { DEFAULT: '#6B6660', dark: '#9A938A' },
        border: { DEFAULT: '#E8E2D8', dark: '#2A2622' },
        accent: { DEFAULT: '#C2410C', soft: '#FFEDD5' },
        teal: { DEFAULT: '#0F766E', soft: '#CCFBF1' },
        success: '#15803D',
        danger: '#B91C1C',
      },
      fontFamily: {
        display: ['Fraunces_500Medium'],
        'display-bold': ['Fraunces_600SemiBold'],
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-bold': ['Inter_600SemiBold'],
      },
    },
  },
  plugins: [],
};
