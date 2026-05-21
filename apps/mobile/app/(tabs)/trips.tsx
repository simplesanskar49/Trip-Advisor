import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TripsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-4">
        <Text className="text-4xl text-ink" style={{ fontFamily: 'Fraunces_500Medium' }}>
          Trips
        </Text>
        <Text className="mt-2 text-muted">Your saved itineraries.</Text>
      </View>
    </SafeAreaView>
  );
}
