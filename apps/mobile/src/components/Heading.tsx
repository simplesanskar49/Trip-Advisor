import { Text, type TextProps } from 'react-native';
import { serifText } from '@/lib/theme';

type Size = 'lg' | 'xl' | '2xl';
type HeadingProps =TextProps & { size?: Size };

const sizeMap: Record<Size, number> = { lg: 24, xl: 30, '2xl': 36 };

export function Heading({ size = '2xl', className, style, children, ...rest }: HeadingProps) {
  return (
    <Text
      {...rest}
      className={`text-ink ${className ?? ''}`}
      style={[{ ...serifText(sizeMap[size]), letterSpacing: -0.5 }, style]}
    >
      {children}
    </Text>
  );
}
