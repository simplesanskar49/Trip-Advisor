import { View, Text } from 'react-native';
import { colors } from '@/lib/theme';

const tones = {
  neutral: { bg: colors.tagNeutralBg, fg: colors.muted },
  accent: { bg: colors.accentSoft, fg: colors.accent },
  teal: { bg: colors.tealSoft, fg: colors.teal },
} as const;

export function Tag({ label, tone = 'neutral' }: { label: string; tone?: keyof typeof tones }) {
  const t = tones[tone];
  return (
    <View style={{ backgroundColor: t.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ color: t.fg, fontSize: 11, fontFamily: 'Inter_500Medium' }}>{label}</Text>
    </View>
  );
}
