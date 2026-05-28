import { Heading } from '@/components/Heading';
import { IconButton } from '@/components/IconButton';
import { ItineraryView } from '@/features/itinerary/ItineraryView';
import { RefineBar } from '@/features/trips/RefineBar';
import { ShareCard } from '@/features/trips/ShareCard';
import { refineItinerary } from '@/lib/api';
import { colors } from '@/lib/theme';
import { useTripsStore } from '@/store/tripsStore';
import { useMutation } from '@tanstack/react-query';
import { friendlyError } from '@trip/ui-core';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = useTripsStore((s) => s.trips.find((t) => t.id === id));
  const removeTrip = useTripsStore((s) => s.removeTrip);
  const updateItinerary = useTripsStore((s) => s.updateItinerary);
  const shareCardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

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

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing unavailable', 'This device cannot share files.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `${trip.destination} itinerary`,
      });
    } catch (err) {
      Alert.alert("Couldn't share", friendlyError(err));
    } finally {
      setSharing(false);
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <View
        style={{
          position: 'absolute',
          left: -10000,
          top: 0,
          opacity: 0,
        }}
        pointerEvents="none"
      >
        <ShareCard
          ref={shareCardRef}
          itinerary={trip.itinerary}
          coverImageUrl={trip.coverImageUrl}
        />
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
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
              <IconButton name="share-outline" onPress={handleShare} disabled={sharing} />
              <IconButton name="trash-outline" color={colors.danger} onPress={handleDelete} />
            </View>
          </View>
        </SafeAreaView>

        <View className="px-5 pt-6">
          <Text
            className="text-muted"
            style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.5 }}
          >
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
