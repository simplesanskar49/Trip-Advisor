import { Tag } from '@/components/Tag';
import { coverImageFor } from '@/lib/coverImage';
import { colors, serifText } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import type { Recommendation } from '@trip/schemas';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const SWIPE_THRESHOLD = 120;
const ROTATE_RANGE = 12; // degrees at full swipe

type SwipeDeckProps = {
  items: Recommendation[];
  onLike: (rec: Recommendation) => void;
  onSkip: (rec: Recommendation) => void;
  onEmpty?: () => void;
};

type DeckCardProps = {
  rec: Recommendation;
  interactive: boolean;
  onLike: () => void;
  onSkip: () => void;
};

export function SwipeDeck({ items, onLike, onSkip, onEmpty }: SwipeDeckProps) {
  const [index, setIndex] = useState(0);

  // Reset deck when the items array changes (e.g. refresh / new fetch).
  useEffect(() => {
    setIndex(0);
  }, [items]);

  const current = items[index];
  const next = items[index + 1];

  const advance = (dir: 'like' | 'skip') => {
    if (!current) return;
    Haptics.notificationAsync(
      dir === 'like'
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {});
    if (dir === 'like') onLike(current);
    else onSkip(current);
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex >= items.length) onEmpty?.();
  };

  if (!current) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Ionicons name="checkmark-done-outline" size={42} color={colors.muted} />
        <Text className="mt-3 text-center" style={{ ...serifText(20), color: colors.muted }}>
          You're all caught up.
        </Text>
        <Text
          className="mt-2 text-center"
          style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.muted }}
        >
          Tap the refresh icon for fresh picks.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-5">
      <View className="flex-1 items-center justify-center">
        {next && (
          <View style={{ position: 'absolute', transform: [{ scale: 0.94 }], opacity: 0.7 }}>
            <DeckCard rec={next} interactive={false} onLike={() => {}} onSkip={() => {}} />
          </View>
        )}
        <DeckCard
          key={current.destination + current.country + index}
          rec={current}
          interactive
          onLike={() => advance('like')}
          onSkip={() => advance('skip')}
        />
      </View>
      <View className="flex-row justify-center gap-6 py-6">
        <Pressable
          onPress={() => advance('skip')}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="close" size={28} color={colors.danger} />
        </Pressable>
        <Pressable
          onPress={() => advance('like')}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.success,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="bookmark" size={24} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

function DeckCard({ rec, interactive, onLike, onSkip }: DeckCardProps) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(interactive)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(width * 1.4, { duration: 240 }, () => {
          runOnJS(onLike)();
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-width * 1.4, { duration: 240 }, () => {
          runOnJS(onSkip)();
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width, 0, width],
      [-ROTATE_RANGE, 0, ROTATE_RANGE],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));
  const skipStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          {
            width: width - 40,
            backgroundColor: colors.surface,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          },
          cardStyle,
        ]}
      >
        <View>
          <Image
            source={{ uri: coverImageFor(`${rec.destination} ${rec.country}`, 1200, 800) }}
            style={{ width: '100%', height: 280 }}
            contentFit="cover"
            transition={300}
          />
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 18,
                left: 18,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 3,
                borderColor: colors.success,
                borderRadius: 8,
                transform: [{ rotate: '-12deg' }],
              },
              likeStyle,
            ]}
          >
            <Text
              style={{ color: colors.success, fontFamily: 'Inter_600SemiBold', letterSpacing: 2 }}
            >
              SAVE
            </Text>
          </Animated.View>
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 18,
                right: 18,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 3,
                borderColor: colors.danger,
                borderRadius: 8,
                transform: [{ rotate: '12deg' }],
              },
              skipStyle,
            ]}
          >
            <Text
              style={{ color: colors.danger, fontFamily: 'Inter_600SemiBold', letterSpacing: 2 }}
            >
              SKIP
            </Text>
          </Animated.View>
        </View>
        <View className="p-5">
          <Text
            className="text-muted"
            style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.5 }}
          >
            {rec.country.toUpperCase()}
          </Text>
          <Text className="text-ink mt-1" style={serifText(26)}>
            {rec.destination}
          </Text>
          <Text
            className="text-ink mt-2 leading-5"
            style={{ fontFamily: 'Inter_400Regular', fontSize: 14 }}
          >
            {rec.blurb}
          </Text>
          <View className="flex-row flex-wrap gap-2 mt-3">
            {rec.tags.slice(0, 4).map((t) => (
              <Tag key={t} label={t} tone="teal" />
            ))}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
