import { useState, useEffect } from 'react';
import { ScrollView, View, Text, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import type { Itinerary } from '@trip/schemas';
import { Heading } from '@/components/Heading';
import { Card } from '@/components/Card';
import { generateItinerary, refineItinerary } from '@/lib/api';
import { useTripsStore } from '@/store/tripsStore';
import { coverImageFor } from '@/lib/coverImage';
import { friendlyError } from '@/lib/friendlyError';
import { PromptForm, type PromptValues } from '@/features/plan/PromptForm';
import { ItinerarySkeleton } from '@/features/plan/ItinerarySkeleton';
import { ItineraryResultCard } from '@/features/itinerary/ItineraryResultCard';

export default function PlanScreen() {
  const [result, setResult] = useState<Itinerary | null>(null);
  const [saved, setSaved] = useState(false);
  const addTrip = useTripsStore((s) => s.addTrip);

  const generateMutation = useMutation({
    mutationFn: (input: PromptValues) =>
      generateItinerary({
        destination: input.destination,
        days: input.days,
        ...(input.vibe ? { vibe: input.vibe } : {}),
      }),
    onSuccess: (data) => {
      setResult(data);
      setSaved(false);
    },
    onError: (err) => Alert.alert("Couldn't plan trip", friendlyError(err)),
  });

  const refineMutation = useMutation({
    mutationFn: (instruction: string) => {
      if (!result) throw new Error('No itinerary to refine');
      return refineItinerary(result, instruction);
    },
    onSuccess: (updated) => setResult(updated),
    onError: (err) => Alert.alert("Couldn't refine", friendlyError(err)),
  });

  const handleSave = () => {
    if (!result || saved) return;
    const trip = addTrip(result, coverImageFor(result.destination));
    setSaved(true);
    router.push({ pathname: '/trip/[id]', params: { id: trip.id } });
  };

  const handleDiscard = () => {
    setResult(null);
    setSaved(false);
    generateMutation.reset();
    refineMutation.reset();
  };

  const busy = generateMutation.isPending || refineMutation.isPending;

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (result || busy) {
        handleDiscard();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [result, busy]);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5">
          <Text className="text-muted" style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1.5 }}>
            PLAN
          </Text>
          <Heading className="mt-1">Where to next?</Heading>
        </View>

        {!result && !generateMutation.isPending && (
          <PromptForm loading={generateMutation.isPending} onSubmit={(v) => generateMutation.mutate(v)} />
        )}

        {generateMutation.isPending && (
          <Card>
            <ItinerarySkeleton />
          </Card>
        )}

        {result && !generateMutation.isPending && (
          <ItineraryResultCard
            itinerary={result}
            saved={saved}
            onSave={handleSave}
            onRefine={(instruction) => refineMutation.mutate(instruction)}
            refining={refineMutation.isPending}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
