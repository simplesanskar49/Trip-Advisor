import tokens from './tokens.js';

export const colors = tokens.colors as Readonly<{
  white: string;
  black: string;
  bg: string;
  bgDark: string;
  surface: string;
  surfaceDark: string;
  ink: string;
  inkDark: string;
  muted: string;
  mutedDark: string;
  placeholder: string;
  border: string;
  borderDark: string;
  skeleton: string;
  accent: string;
  accentSoft: string;
  tagNeutralBg: string;
  teal: string;
  tealSoft: string;
  success: string;
  danger: string;
}>;

export const spacing = tokens.spacing as Readonly<Record<string, number>>;
export const radius = tokens.radius as Readonly<Record<string, number>>;

/**
 * Serif (Fraunces) text style with safe line-height so descenders (g, y, p)
 * are never clipped on Android. Always prefer this over inline fontFamily.
 */
export const serifText = (fontSize: number) => ({
  fontFamily: 'Fraunces_500Medium' as const,
  fontSize,
  lineHeight: Math.round(fontSize * 1.3),
});
