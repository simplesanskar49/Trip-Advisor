import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { Itinerary, DayPlan, ActivityBlock } from '@trip/schemas';
import { Tag } from '@/components/Tag';
import { colors, serifText } from '@/lib/theme';

const timeLabels: Record<ActivityBlock['timeOfDay'], string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

function Block({ block, last, delay }: { block: ActivityBlock; last: boolean; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.duration(450).delay(delay).springify().damping(18)} style={{ flexDirection: 'row' }}>
      <View className="items-center" style={{ width: 28 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent, marginTop: 6 }} />
        {!last && <View style={{ flex: 1, width: 2, backgroundColor: colors.accentSoft, marginTop: 4 }} />}
      </View>
      <View className="flex-1 pb-6">
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.accent, letterSpacing: 1 }}>
          {timeLabels[block.timeOfDay].toUpperCase()}
        </Text>
        <Text className="text-ink mt-1" style={serifText(18)}>
          {block.title}
        </Text>
        <Text className="text-muted mt-0.5" style={{ fontFamily: 'Inter_400Regular', fontSize: 13 }}>
          {block.place}
        </Text>
        <Text className="text-ink mt-2 leading-5" style={{ fontFamily: 'Inter_400Regular', fontSize: 14 }}>
          {block.description}
        </Text>
        {(block.estimatedCost || block.durationMinutes) && (
          <View className="flex-row gap-2 mt-3">
            {block.estimatedCost && <Tag label={block.estimatedCost} />}
            {block.durationMinutes && (
              <Tag label={`${Math.round((block.durationMinutes / 60) * 10) / 10}h`} />
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function Day({ day, baseDelay }: { day: DayPlan; baseDelay: number }) {
  return (
    <View className="mt-6">
      <Animated.Text
        entering={FadeInDown.duration(400).delay(baseDelay)}
        className="text-muted"
        style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.5 }}
      >
        DAY {day.day}
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.duration(450).delay(baseDelay + 50)}
        className="text-ink mt-1 mb-4"
        style={serifText(24)}
      >
        {day.title}
      </Animated.Text>
      {day.blocks.map((b, i) => (
        <Block
          key={`${day.day}-${i}-${b.title}`}
          block={b}
          last={i === day.blocks.length - 1}
          delay={baseDelay + 100 + i * 90}
        />
      ))}
    </View>
  );
}

export function ItineraryView({ itinerary }: { itinerary: Itinerary }) {
  return (
    <View>
      <Animated.Text
        entering={FadeInDown.duration(400)}
        className="text-ink leading-6"
        style={{ fontFamily: 'Inter_400Regular', fontSize: 15 }}
      >
        {itinerary.summary}
      </Animated.Text>
      {itinerary.days.map((d, idx) => (
        <Day key={`${d.day}-${d.title}`} day={d} baseDelay={150 + idx * 120} />
      ))}
    </View>
  );
}
