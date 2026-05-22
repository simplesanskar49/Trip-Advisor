import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import type { Itinerary } from '@trip/schemas';
import { Card } from '@/components/Card';
import { Heading } from '@/components/Heading';
import { IconButton } from '@/components/IconButton';
import { ItineraryView } from '@/features/itinerary/ItineraryView';
import { RefineBar } from '@/features/trips/RefineBar';
import { coverImageFor } from '@/lib/coverImage';
import { colors } from '@/lib/theme';

type ItineraryResultCardProps ={
  itinerary: Itinerary;
  saved: boolean;
  onSave: () => void;
  onRefine: (instruction: string) => void;
  refining: boolean;
};

export function ItineraryResultCard({ itinerary, saved, onSave, onRefine, refining }: ItineraryResultCardProps) {
  return (
    <View>
      <Card padded={false} className="overflow-hidden">
        <View>
          <Image
            source={{ uri: coverImageFor(itinerary.destination, 1200, 600) }}
            style={{ width: '100%', height: 180 }}
            contentFit="cover"
            transition={300}
          />
          <View style={{ position: 'absolute', top: 12, right: 12 }}>
            <IconButton
              name={saved ? 'heart' : 'heart-outline'}
              color={saved ? colors.accent : colors.ink}
              onPress={onSave}
              disabled={saved}
            />
          </View>
        </View>
        <View className="p-5">
          <Text className="text-muted" style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.5 }}>
            ITINERARY
          </Text>
          <Heading size="xl" className="mt-1 mb-4">
            {itinerary.destination}
          </Heading>
          <ItineraryView itinerary={itinerary} />
        </View>
      </Card>
      <View className="mt-3">
        <RefineBar loading={refining} onSubmit={onRefine} />
      </View>
    </View>
  );
}
