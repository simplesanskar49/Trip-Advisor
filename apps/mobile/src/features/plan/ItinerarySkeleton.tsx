import { Skeleton } from '@/components/Skeleton';
import { View } from 'react-native';

export function ItinerarySkeleton() {
  return (
    <View>
      <Skeleton width="90%" height={14} />
      <View style={{ height: 8 }} />
      <Skeleton width="75%" height={14} />

      {[0, 1, 2].map((i) => (
        <View key={i} style={{ marginTop: 28 }}>
          <Skeleton width={60} height={10} />
          <View style={{ height: 8 }} />
          <Skeleton width="55%" height={22} />
          <View style={{ height: 16 }} />
          {[0, 1, 2].map((j) => (
            <View key={j} style={{ marginBottom: 18 }}>
              <Skeleton width={80} height={10} />
              <View style={{ height: 6 }} />
              <Skeleton width="70%" height={16} />
              <View style={{ height: 6 }} />
              <Skeleton width="95%" height={12} />
              <View style={{ height: 4 }} />
              <Skeleton width="88%" height={12} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
