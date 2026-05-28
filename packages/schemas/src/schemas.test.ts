import { describe, expect, it } from 'vitest';
import {
  ActivityBlockSchema,
  GenerateItineraryRequestSchema,
  ItinerarySchema,
  RecommendationsResponseSchema,
} from './index';

const validBlock = {
  timeOfDay: 'morning' as const,
  title: 'Senso-ji Temple',
  place: 'Asakusa',
  description: 'Visit the ancient Buddhist temple at sunrise.',
};

const validItinerary = {
  destination: 'Tokyo, Japan',
  summary: 'A 4-day food and culture trip.',
  days: [
    { day: 1, title: 'Old Tokyo', blocks: [validBlock] },
    { day: 2, title: 'Modern Tokyo', blocks: [{ ...validBlock, timeOfDay: 'evening' as const }] },
  ],
};

describe('ActivityBlockSchema', () => {
  it('accepts a valid block', () => {
    expect(() => ActivityBlockSchema.parse(validBlock)).not.toThrow();
  });

  it('rejects an unknown timeOfDay', () => {
    expect(() => ActivityBlockSchema.parse({ ...validBlock, timeOfDay: 'midnight' })).toThrow();
  });

  it('rejects blank title', () => {
    expect(() => ActivityBlockSchema.parse({ ...validBlock, title: '' })).toThrow();
  });

  it('rejects negative durationMinutes', () => {
    expect(() => ActivityBlockSchema.parse({ ...validBlock, durationMinutes: -5 })).toThrow();
  });
});

describe('ItinerarySchema', () => {
  it('round-trips a valid itinerary', () => {
    const parsed = ItinerarySchema.parse(validItinerary);
    expect(parsed.days).toHaveLength(2);
    expect(parsed.destination).toBe('Tokyo, Japan');
  });

  it('rejects empty days', () => {
    expect(() => ItinerarySchema.parse({ ...validItinerary, days: [] })).toThrow();
  });

  it('rejects more than 14 days', () => {
    const tooMany = {
      ...validItinerary,
      days: Array.from({ length: 15 }, (_, i) => ({
        day: i + 1,
        title: `Day ${i + 1}`,
        blocks: [validBlock],
      })),
    };
    expect(() => ItinerarySchema.parse(tooMany)).toThrow();
  });
});

describe('GenerateItineraryRequestSchema', () => {
  it('clamps days to 1-14', () => {
    expect(() => GenerateItineraryRequestSchema.parse({ destination: 'X', days: 0 })).toThrow();
    expect(() => GenerateItineraryRequestSchema.parse({ destination: 'X', days: 15 })).toThrow();
    expect(() => GenerateItineraryRequestSchema.parse({ destination: 'X', days: 4 })).not.toThrow();
  });
});

describe('RecommendationsResponseSchema', () => {
  it('requires at least one recommendation', () => {
    expect(() => RecommendationsResponseSchema.parse({ recommendations: [] })).toThrow();
  });

  it('caps tags at 6', () => {
    const rec = {
      destination: 'Lisbon',
      country: 'Portugal',
      blurb: 'Sunny coastal capital.',
      reason: 'Pairs with Barcelona.',
      tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    };
    expect(() => RecommendationsResponseSchema.parse({ recommendations: [rec] })).toThrow();
  });
});
