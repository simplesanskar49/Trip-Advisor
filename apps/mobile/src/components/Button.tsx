import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';
import { colors } from '@/lib/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type ButtonProps =Omit<PressableProps, 'children'> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
};

const variantStyles: Record<Variant, string> = {
  primary: 'bg-accent',
  secondary: 'bg-surface border border-border',
  ghost: 'bg-transparent',
};

const textStyles: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-ink',
  ghost: 'text-ink',
};

export function Button({ title, variant = 'primary', loading, disabled, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      className={`w-full flex-row items-center justify-center rounded-2xl px-5 py-4 ${variantStyles[variant]} ${isDisabled ? 'opacity-60' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.ink} />
      ) : (
        <Text
          className={`${textStyles[variant]} font-semibold text-base`}
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
