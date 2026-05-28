import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, serifText } from '@/lib/theme';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

const dayOptions = [2, 3, 4, 5, 7];

export type PromptValues = { destination: string; days: number; vibe: string };

type PromptFormProps = {
  loading: boolean;
  onSubmit: (values: PromptValues) => void;
};

export function PromptForm({ loading, onSubmit }: PromptFormProps) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(4);
  const [vibe, setVibe] = useState('');

  const canSubmit = destination.trim().length > 1 && !loading;

  return (
    <Card>
      <Text
        className="text-muted"
        style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.5 }}
      >
        DESTINATION
      </Text>
      <TextInput
        value={destination}
        onChangeText={setDestination}
        placeholder="e.g. Lisbon, Portugal"
        placeholderTextColor={colors.placeholder}
        className="text-ink mt-2 pb-2 border-b border-border"
        style={serifText(22)}
        autoCapitalize="words"
      />

      <Text
        className="text-muted mt-5"
        style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.5 }}
      >
        DAYS
      </Text>
      <View className="flex-row gap-2 mt-2">
        {dayOptions.map((d) => (
          <Pressable
            key={d}
            onPress={() => setDays(d)}
            className={`px-4 py-2 rounded-full border ${days === d ? 'bg-ink border-ink' : 'bg-surface border-border'}`}
          >
            <Text
              className={days === d ? 'text-white' : 'text-ink'}
              style={{ fontFamily: 'Inter_500Medium', fontSize: 14 }}
            >
              {d}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text
        className="text-muted mt-5"
        style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.5 }}
      >
        VIBE (OPTIONAL)
      </Text>
      <TextInput
        value={vibe}
        onChangeText={setVibe}
        placeholder="solo, love food + design, hate crowds"
        placeholderTextColor={colors.placeholder}
        multiline
        className="text-ink mt-2 pb-2 border-b border-border"
        style={{ fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 44 }}
      />

      <View className="mt-6">
        <Button
          title={loading ? 'Crafting your trip…' : 'Generate itinerary'}
          loading={loading}
          disabled={!canSubmit}
          onPress={() => onSubmit({ destination: destination.trim(), days, vibe: vibe.trim() })}
        />
      </View>
    </Card>
  );
}
