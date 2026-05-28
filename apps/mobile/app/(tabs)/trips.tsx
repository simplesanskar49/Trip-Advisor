import { Card } from '@/components/Card';
import { Heading } from '@/components/Heading';
import { TripCard } from '@/features/trips/TripCard';
import { serifText } from '@/lib/theme';
import { useTripsStore } from '@/store/tripsStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TripsScreen() {
  const trips = useTripsStore((s) => s.trips);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        bounces={false}
        overScrollMode="never"
      >
        <View className="mb-5">
          <Text
            className="text-muted"
            style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1.5 }}
          >
            LIBRARY
          </Text>
          <Heading className="mt-1">Trips</Heading>
        </View>

        {trips.length === 0 ? (
          <Card>
            <View className="items-center py-8">
              <Ionicons name="map-outline" size={40} color="#C2410C" />
              <Text className="text-ink mt-3" style={serifText(20)}>
                No trips yet
              </Text>
              <Text
                className="text-muted mt-2 text-center px-6"
                style={{ fontFamily: 'Inter_400Regular', fontSize: 14 }}
              >
                Head to the Plan tab to craft your first itinerary.
              </Text>
            </View>
          </Card>
        ) : (
          trips.map((t) => (
            <TripCard
              key={t.id}
              trip={t}
              onPress={() => router.push({ pathname: '/trip/[id]', params: { id: t.id } })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
