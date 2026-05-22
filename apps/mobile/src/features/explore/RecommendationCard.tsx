import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import type { Recommendation } from '@trip/schemas';
import { Tag } from '@/components/Tag';
import { coverImageFor } from '@/lib/coverImage';
import { colors, serifText } from '@/lib/theme';

type RecommendationCardProps ={ rec: Recommendation; onPress: () => void; loading?: boolean };

export function RecommendationCard({ rec, onPress, loading }: RecommendationCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={1}
      className={`rounded-2xl overflow-hidden border border-border bg-surface mb-4 ${loading ? 'opacity-60' : ''}`}
    >
      <Image
        source={{ uri: coverImageFor(`${rec.destination} ${rec.country}`, 1200, 600) }}
        style={{ width: '100%', height: 150 }}
        contentFit="cover"
        transition={300}
      />
      <View className="p-4">
        <Text className="text-muted" style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.5 }}>
          {rec.country.toUpperCase()}
        </Text>
        <Text className="text-ink mt-1" style={serifText(22)}>
          {rec.destination}
        </Text>
        <Text className="text-ink mt-2 leading-5" style={{ fontFamily: 'Inter_400Regular', fontSize: 14 }}>
          {rec.blurb}
        </Text>
        <View className="flex-row flex-wrap gap-2 mt-3">
          {rec.tags.slice(0, 4).map((t) => (
            <Tag key={t} label={t} tone="teal" />
          ))}
        </View>
        <View
          className="mt-4 pt-3"
          style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        >
          <Text className="text-muted" style={{ fontFamily: 'Inter_400Regular', fontSize: 12, fontStyle: 'italic' }}>
            {rec.reason}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
