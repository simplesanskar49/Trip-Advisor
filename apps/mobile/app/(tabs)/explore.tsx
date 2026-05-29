import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Heading } from '@/components/Heading';
import { IconButton } from '@/components/IconButton';
import { Skeleton } from '@/components/Skeleton';
import { SwipeDeck } from '@/features/explore/SwipeDeck';
import { ItineraryResultCard } from '@/features/itinerary/ItineraryResultCard';
import { ItinerarySkeleton } from '@/features/plan/ItinerarySkeleton';
import { generateItinerary, getRecommendations, refineItinerary } from '@/lib/api';
import { coverImageFor } from '@/lib/coverImage';
import { colors, serifText } from '@/lib/theme';
import { useTripsStore } from '@/store/tripsStore';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { Itinerary, Recommendation } from '@trip/schemas';
import { friendlyError } from '@trip/ui-core';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PreviewState =
  | { mode: 'list' }
  | { mode: 'preview'; destination: string; itinerary: Itinerary | null; saved: boolean };

export default function ExploreScreen() {
  const trips = useTripsStore((s) => s.trips);
  const addTrip = useTripsStore((s) => s.addTrip);
  const [state, setState] = useState<PreviewState>({ mode: 'list' });
  const [liked, setLiked] = useState<Recommendation[]>([]);
  const [showLiked, setShowLiked] = useState(false);

  const recKey = (r: Recommendation) => `${r.destination}-${r.country}`;

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
              <Text
                className="text-muted"
                style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1.5 }}
              >
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
      <View className="px-5 pt-2 pb-3 flex-row justify-between items-end">
        <View>
          <Text
            className="text-muted"
            style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1.5 }}
          >
            FOR YOU
          </Text>
          <Heading className="mt-1">Discover</Heading>
        </View>
        <View className="flex-row items-center gap-3">
          {liked.length > 0 && (
            <Pressable
              onPress={() => setShowLiked(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: colors.success,
              }}
            >
              <Ionicons name="bookmark" size={14} color={colors.white} />
              <Text style={{ color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>
                {liked.length}
              </Text>
            </Pressable>
          )}
          <Pressable onPress={() => recsQuery.refetch({ cancelRefetch: true })} hitSlop={10}>
            <Ionicons
              name="refresh"
              size={22}
              color={recsQuery.isFetching ? colors.muted : colors.ink}
            />
          </Pressable>
        </View>
      </View>

      {recsQuery.isFetching && (
        <View className="flex-1 px-5">
          <Card padded={false} className="overflow-hidden">
            <Skeleton width="100%" height={280} rounded={0} />
            <View className="p-5">
              <Skeleton width={80} height={10} />
              <View style={{ height: 10 }} />
              <Skeleton width="60%" height={22} />
              <View style={{ height: 12 }} />
              <Skeleton width="100%" height={12} />
              <View style={{ height: 4 }} />
              <Skeleton width="85%" height={12} />
            </View>
          </Card>
        </View>
      )}

      {!recsQuery.isFetching && recsQuery.isError && (
        <View className="flex-1 px-5 justify-center">
          <Card>
            <View className="items-center py-4">
              <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
              <Text className="text-ink mt-2" style={serifText(18)}>
                Couldn't load recommendations
              </Text>
              <Text
                className="text-muted mt-1 text-center"
                style={{ fontFamily: 'Inter_400Regular', fontSize: 13 }}
              >
                {friendlyError(recsQuery.error)}
              </Text>
              <View className="mt-4 w-full">
                <Button title="Try again" variant="secondary" onPress={() => recsQuery.refetch()} />
              </View>
            </View>
          </Card>
        </View>
      )}

      {!recsQuery.isFetching && recsQuery.data && (
        <SwipeDeck
          items={recsQuery.data.recommendations}
          onLike={(rec) =>
            setLiked((prev) =>
              prev.some((r) => recKey(r) === recKey(rec)) ? prev : [...prev, rec],
            )
          }
          onSkip={() => {}}
          onEmpty={() => {
            if (liked.length > 0) setShowLiked(true);
            else recsQuery.refetch();
          }}
        />
      )}

      <Modal
        visible={showLiked}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLiked(false)}
      >
        <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
          <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
            <View>
              <Text
                className="text-muted"
                style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1.5 }}
              >
                YOUR PICKS
              </Text>
              <Heading className="mt-1">Saved ({liked.length})</Heading>
            </View>
            <Pressable onPress={() => setShowLiked(false)} hitSlop={10}>
              <Ionicons name="close" size={26} color={colors.ink} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
            {liked.length === 0 ? (
              <Text className="text-muted mt-8 text-center" style={serifText(18)}>
                Nothing saved yet.
              </Text>
            ) : (
              liked.map((rec) => (
                <Pressable
                  key={recKey(rec)}
                  onPress={() => {
                    setShowLiked(false);
                    handleStartPreview(rec);
                  }}
                  className="mb-3 p-4 rounded-2xl"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <Text
                        className="text-muted"
                        style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 1.5 }}
                      >
                        {rec.country.toUpperCase()}
                      </Text>
                      <Text className="text-ink mt-1" style={serifText(18)}>
                        {rec.destination}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Pressable
                        hitSlop={8}
                        onPress={() =>
                          setLiked((prev) => prev.filter((r) => recKey(r) !== recKey(rec)))
                        }
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.muted} />
                      </Pressable>
                      <Ionicons name="chevron-forward" size={20} color={colors.ink} />
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
