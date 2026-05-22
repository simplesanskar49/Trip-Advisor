const { colors } = require('./src/lib/tokens.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: colors.bg, dark: colors.bgDark },
        surface: { DEFAULT: colors.surface, dark: colors.surfaceDark },
        ink: { DEFAULT: colors.ink, dark: colors.inkDark },
        muted: { DEFAULT: colors.muted, dark: colors.mutedDark },
        border: { DEFAULT: colors.border, dark: colors.borderDark },
        accent: { DEFAULT: colors.accent, soft: colors.accentSoft },
        teal: { DEFAULT: colors.teal, soft: colors.tealSoft },
        success: colors.success,
        danger: colors.danger,
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
