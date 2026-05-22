/**
 * Single source of truth for design tokens.
 *
 * - tailwind.config.js requires() this file so colors are usable via className.
 * - theme.ts re-exports the same values so they're usable in JS (Ionicons,
 *   ActivityIndicator, shadowColor, placeholderTextColor, Reanimated, etc.).
 *
 * .js (not .ts) so it can be require()'d by tailwind.config.js at build time.
 */
const colors = {
  white: '#FFFFFF',
  black: '#000000',
  bg: '#FAF7F2',
  bgDark: '#0F0E0C',
  surface: '#FFFFFF',
  surfaceDark: '#1A1815',
  ink: '#1A1A1A',
  inkDark: '#F5F1EA',
  muted: '#6B6660',
  mutedDark: '#9A938A',
  placeholder: '#9A938A',
  border: '#E8E2D8',
  borderDark: '#2A2622',
  skeleton: '#E8E2D8',
  accent: '#C2410C',
  accentSoft: '#FFEDD5',
  tagNeutralBg: '#F3EFE8',
  teal: '#0F766E',
  tealSoft: '#CCFBF1',
  success: '#15803D',
  danger: '#B91C1C',
};

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32 };
const radius = { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 };

module.exports = { colors, spacing, radius };
