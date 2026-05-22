import { View, type ViewProps } from 'react-native';
import { colors } from '@/lib/theme';

type CardProps = ViewProps & { padded?: boolean };

export function Card({ padded = true, className, children, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      className={`rounded-2xl border border-border bg-surface ${padded ? 'p-5' : ''} ${className ?? ''}`}
      style={[
        { shadowColor: colors.black, shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
        rest.style,
      ]}
    >
      {children}
    </View>
  );
}
