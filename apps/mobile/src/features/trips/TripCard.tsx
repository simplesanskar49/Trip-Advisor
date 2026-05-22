import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import type { SavedTrip } from '@/store/tripsStore';
import { serifText } from '@/lib/theme';

export function TripCard({ trip, onPress }: { trip: SavedTrip; onPress: () => void }) {
  const dayCount = trip.itinerary.days.length;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      className="rounded-2xl overflow-hidden border border-border bg-surface mb-4">
      {trip.coverImageUrl && (
        <Image
          source={{ uri: trip.coverImageUrl }}
          style={{ width: '100%', height: 160 }}
          contentFit="cover"
          transition={300}
        />
      )}
      <View className="p-4">
        <Text className="text-muted" style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.5 }}>
          {dayCount} {dayCount === 1 ? 'DAY' : 'DAYS'}
        </Text>
        <Text className="text-ink mt-1" style={serifText(22)}>
          {trip.destination}
        </Text>
        <Text className="text-muted mt-1 leading-5" numberOfLines={2} style={{ fontFamily: 'Inter_400Regular', fontSize: 13 }}>
          {trip.itinerary.summary}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
