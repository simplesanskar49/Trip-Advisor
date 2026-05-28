import { colors, serifText } from '@/lib/theme';
import type { Itinerary } from '@trip/schemas';
import { Image } from 'expo-image';
import { forwardRef } from 'react';
import { Text, View } from 'react-native';

type ShareCardProps = {
  itinerary: Itinerary;
  coverImageUrl?: string;
};

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;

export const ShareCard = forwardRef<View, ShareCardProps>(({ itinerary, coverImageUrl }, ref) => {
  const highlights = itinerary.days.flatMap((d) => d.blocks.map((b) => b.title)).slice(0, 6);

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: colors.bg,
        padding: 80,
      }}
    >
      {coverImageUrl && (
        <Image
          source={{ uri: coverImageUrl }}
          style={{
            width: '100%',
            height: 760,
            borderRadius: 32,
          }}
          contentFit="cover"
        />
      )}

      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 28,
          letterSpacing: 4,
          color: colors.accent,
          marginTop: 60,
        }}
      >
        {itinerary.days.length} DAY ITINERARY
      </Text>

      <Text style={{ ...serifText(120), color: colors.ink, marginTop: 12 }}>
        {itinerary.destination}
      </Text>

      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 32,
          lineHeight: 46,
          color: colors.muted,
          marginTop: 28,
        }}
        numberOfLines={3}
      >
        {itinerary.summary}
      </Text>

      <View style={{ marginTop: 50 }}>
        {highlights.map((h, i) => (
          <View key={`${h}-${i}`} style={{ flexDirection: 'row', marginBottom: 18 }}>
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: colors.accent,
                marginTop: 16,
                marginRight: 22,
              }}
            />
            <Text
              style={{
                ...serifText(36),
                color: colors.ink,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {h}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';
