import { useState } from 'react';
import { View, TextInput, Pressable, Text, ActivityIndicator, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

type RefineBarProps ={
  loading: boolean;
  onSubmit: (instruction: string) => void;
};

const SUGGESTIONS = [
  'make day 2 more relaxed',
  'add a hidden gem dinner spot',
  'swap one activity for something rainy-day',
];

export function RefineBar({ loading, onSubmit }: RefineBarProps) {
  const [value, setValue] = useState('');

  const submit = (text?: string) => {
    const v = (text ?? value).trim();
    if (!v || loading) return;
    onSubmit(v);
    setValue('');
    Keyboard.dismiss();
  };

  const submitDisabled = loading || value.trim().length === 0;

  return (
    <View className="rounded-2xl border border-border bg-surface p-4">
      <View className="flex-row items-center gap-2">
        <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
        <Text className="text-ink" style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14 }}>
          Refine this trip
        </Text>
      </View>
      <View className="flex-row items-end gap-2 mt-3">
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Tell us what to change…"
          placeholderTextColor={colors.placeholder}
          multiline
          className="flex-1 text-ink pb-2 border-b border-border"
          style={{ fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 36 }}
          editable={!loading}
          onSubmitEditing={() => submit()}
        />
        <Pressable
          onPress={() => submit()}
          disabled={submitDisabled}
          className={`rounded-full p-3 ${submitDisabled ? 'opacity-40' : ''}`}
          style={{ backgroundColor: colors.accent }}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Ionicons name="arrow-up" size={18} color={colors.white} />
          )}
        </Pressable>
      </View>
      <View className="flex-row flex-wrap gap-2 mt-3">
        {SUGGESTIONS.map((s) => (
          <Pressable
            key={s}
            onPress={() => submit(s)}
            disabled={loading}
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: colors.accentSoft }}
          >
            <Text style={{ color: colors.accent, fontFamily: 'Inter_500Medium', fontSize: 12 }}>{s}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
