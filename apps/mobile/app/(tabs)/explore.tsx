import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-4">
        <Text className="text-4xl text-ink" style={{ fontFamily: 'Fraunces_500Medium' }}>
          Explore
        </Text>
        <Text className="mt-2 text-muted">Destinations picked for you.</Text>
      </View>
    </SafeAreaView>
  );
}
