import { ScrollView, View, Text, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { useMutation } from '@tanstack/react-query';
import type { Itinerary } from '@trip/schemas';
import { Heading } from '@/components/Heading';
import { IconButton } from '@/components/IconButton';
import { colors } from '@/lib/theme';
import { useTripsStore } from '@/store/tripsStore';
import { ItineraryView } from '@/features/itinerary/ItineraryView';
import { RefineBar } from '@/features/trips/RefineBar';
import { refineItinerary } from '@/lib/api';
import { friendlyError } from '@/lib/friendlyError';

function itineraryToShareText(itinerary: Itinerary): string {
  const lines: string[] = [
    `${itinerary.destination} — ${itinerary.days.length}-day itinerary`,
    '',
    itinerary.summary,
    '',
  ];
  for (const day of itinerary.days) {
    lines.push(`Day ${day.day}: ${day.title}`);
    for (const b of day.blocks) {
      lines.push(`  ${b.timeOfDay}: ${b.title} (${b.place})`);
    }
    lines.push('');
  }
  lines.push('— planned with Trip Advisor');
  return lines.join('\n');
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = useTripsStore((s) => s.trips.find((t) => t.id === id));
  const removeTrip = useTripsStore((s) => s.removeTrip);
  const updateItinerary = useTripsStore((s) => s.updateItinerary);

  const refineMutation = useMutation({
    mutationFn: (instruction: string) => {
      if (!trip) throw new Error('Trip missing');
      return refineItinerary(trip.itinerary, instruction);
    },
    onSuccess: (updated) => {
      if (trip) updateItinerary(trip.id, updated);
    },
    onError: (err) => Alert.alert("Couldn't refine", friendlyError(err)),
  });

  if (!trip) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <Text className="text-muted">Trip not found.</Text>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete trip?', `Remove "${trip.destination}" from your library.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeTrip(trip.id);
          router.back();
        },
      },
    ]);
  };

  const handleShare = () => {
    Share.share({
      title: `${trip.destination} itinerary`,
      message: itineraryToShareText(trip.itinerary),
    }).catch(() => {});
  };

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {trip.coverImageUrl && (
          <Image
            source={{ uri: trip.coverImageUrl }}
            style={{ width: '100%', height: 260 }}
            contentFit="cover"
            transition={300}
          />
        )}
        <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <View className="flex-row justify-between px-4 pt-2">
            <IconButton name="chevron-back" size={22} onPress={() => router.back()} />
            <View className="flex-row gap-2">
              <IconButton name="share-outline" onPress={handleShare} />
              <IconButton name="trash-outline" color={colors.danger} onPress={handleDelete} />
            </View>
          </View>
        </SafeAreaView>

        <View className="px-5 pt-6">
          <Text className="text-muted" style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.5 }}>
            {trip.itinerary.days.length} DAY ITINERARY
          </Text>
          <Heading size="2xl" className="mt-1 mb-4">
            {trip.destination}
          </Heading>
          <ItineraryView itinerary={trip.itinerary} />

          <RefineBar
            loading={refineMutation.isPending}
            onSubmit={(instruction) => refineMutation.mutate(instruction)}
          />
        </View>
      </ScrollView>
    </View>
  );
}
