import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, RefreshControl, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Itinerary, Recommendation } from '@trip/schemas';
import { Heading } from '@/components/Heading';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { Skeleton } from '@/components/Skeleton';
import { useTripsStore } from '@/store/tripsStore';
import { generateItinerary, getRecommendations, refineItinerary } from '@/lib/api';
import { coverImageFor } from '@/lib/coverImage';
import { friendlyError } from '@/lib/friendlyError';
import { serifText } from '@/lib/theme';
import { RecommendationCard } from '@/features/explore/RecommendationCard';
import { ItinerarySkeleton } from '@/features/plan/ItinerarySkeleton';
import { ItineraryResultCard } from '@/features/itinerary/ItineraryResultCard';

type PreviewState =
  | { mode: 'list' }
  | { mode: 'preview'; destination: string; itinerary: Itinerary | null; saved: boolean };

export default function ExploreScreen() {
  const trips = useTripsStore((s) => s.trips);
  const addTrip = useTripsStore((s) => s.addTrip);
  const [state, setState] = useState<PreviewState>({ mode: 'list' });

  const seeds = useMemo(() => trips.map((t) => t.destination), [trips]);

  const recsQuery = useQuery({
    queryKey: ['recommendations', seeds],
    queryFn: () => getRecommendations(seeds),
    staleTime: 5 * 60_000,
  });

  const generateMutation = useMutation({
    mutationFn: (rec: Recommendation) =>
      generateItinerary({ destination: `${rec.destination}, ${rec.country}`, days: 4 }),
    onSuccess: (itinerary) =>
      setState({ mode: 'preview', destination: itinerary.destination, itinerary, saved: false }),
    onError: (err) => {
      setState({ mode: 'list' });
      Alert.alert("Couldn't draft trip", friendlyError(err));
    },
  });

  const refineMutation = useMutation({
    mutationFn: (instruction: string) => {
      if (state.mode !== 'preview' || !state.itinerary) throw new Error('No itinerary');
      return refineItinerary(state.itinerary, instruction);
    },
    onSuccess: (updated) =>
      setState((s) => (s.mode === 'preview' ? { ...s, itinerary: updated } : s)),
    onError: (err) => Alert.alert("Couldn't refine", friendlyError(err)),
  });

  const handleStartPreview = (rec: Recommendation) => {
    const destination = `${rec.destination}, ${rec.country}`;
    setState({ mode: 'preview', destination, itinerary: null, saved: false });
    generateMutation.mutate(rec);
  };

  const handleBackToList = () => {
    setState({ mode: 'list' });
    generateMutation.reset();
    refineMutation.reset();
  };

  const handleSave = () => {
    if (state.mode !== 'preview' || !state.itinerary || state.saved) return;
    const trip = addTrip(state.itinerary, coverImageFor(state.itinerary.destination));
    setState({ ...state, saved: true });
    router.push({ pathname: '/trip/[id]', params: { id: trip.id } });
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (state.mode === 'preview') {
        handleBackToList();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [state.mode]);

  if (state.mode === 'preview') {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center mb-5">
            <View className="mr-3">
              <IconButton name="chevron-back" variant="subtle" onPress={handleBackToList} />
            </View>
            <View className="flex-1">
              <Text className="text-muted" style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1.5 }}>
                DRAFTING
              </Text>
              <Heading size="lg" className="mt-0.5">
                {state.destination}
              </Heading>
            </View>
          </View>

          {!state.itinerary ? (
            <Card>
              <ItinerarySkeleton />
            </Card>
          ) : (
            <ItineraryResultCard
              itinerary={state.itinerary}
              saved={state.saved}
              onSave={handleSave}
              onRefine={(instruction) => refineMutation.mutate(instruction)}
              refining={refineMutation.isPending}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 }}
        refreshControl={<RefreshControl refreshing={recsQuery.isFetching} onRefresh={() => recsQuery.refetch()} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5">
          <Text className="text-muted" style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1.5 }}>
            FOR YOU
          </Text>
          <Heading className="mt-1">Explore</Heading>
          <Text className="text-muted mt-2 leading-5" style={{ fontFamily: 'Inter_400Regular', fontSize: 14 }}>
            {seeds.length > 0
              ? `Based on your ${seeds.length} saved ${seeds.length === 1 ? 'trip' : 'trips'}.`
              : 'Curated picks to get you started.'}
          </Text>
        </View>

        {recsQuery.isLoading && (
          <View>
            {[0, 1, 2].map((i) => (
              <Card key={i} padded={false} className="mb-4 overflow-hidden">
                <Skeleton width="100%" height={150} rounded={0} />
                <View className="p-4">
                  <Skeleton width={80} height={10} />
                  <View style={{ height: 8 }} />
                  <Skeleton width="60%" height={20} />
                  <View style={{ height: 10 }} />
                  <Skeleton width="100%" height={12} />
                  <View style={{ height: 4 }} />
                  <Skeleton width="85%" height={12} />
                </View>
              </Card>
            ))}
          </View>
        )}

        {recsQuery.isError && (
          <Card>
            <View className="items-center py-4">
              <Ionicons name="cloud-offline-outline" size={32} color="#B91C1C" />
              <Text className="text-ink mt-2" style={serifText(18)}>
                Couldn't load recommendations
              </Text>
              <Text className="text-muted mt-1 text-center" style={{ fontFamily: 'Inter_400Regular', fontSize: 13 }}>
                {friendlyError(recsQuery.error)}
              </Text>
              <View className="mt-4 w-full">
                <Button title="Try again" variant="secondary" onPress={() => recsQuery.refetch()} />
              </View>
            </View>
          </Card>
        )}

        {recsQuery.data?.recommendations.map((rec) => (
          <RecommendationCard
            key={`${rec.destination}-${rec.country}`}
            rec={rec}
            onPress={() => handleStartPreview(rec)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
