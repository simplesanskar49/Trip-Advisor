import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { pingApi } from '@/lib/api';

export default function PlanScreen() {
  const { data, isLoading, error } = useQuery({ queryKey: ['health'], queryFn: pingApi });

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-4">
        <Text className="text-4xl text-ink" style={{ fontFamily: 'Fraunces_500Medium' }}>
          Plan
        </Text>
        <Text className="mt-2 text-muted">Where to next?</Text>

        <View className="mt-8 rounded-2xl border border-border bg-surface p-5">
          <Text className="text-ink font-semibold">API status</Text>
          <Text className="mt-1 text-muted">
            {isLoading ? 'pinging…' : error ? `error: ${(error as Error).message}` : `ok · ${data?.env}`}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
