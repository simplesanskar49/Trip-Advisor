import { colors } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, type PressableProps } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  name: IoniconName;
  color?: string;
  size?: number;
  variant?: 'overlay' | 'subtle';
};

export function IconButton({
  name,
  color = colors.ink,
  size = 20,
  variant = 'overlay',
  ...rest
}: IconButtonProps) {
  const bg = variant === 'overlay' ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.04)';
  return (
    <Pressable
      {...rest}
      hitSlop={8}
      style={{ backgroundColor: bg, borderRadius: 999, padding: 10 }}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}
