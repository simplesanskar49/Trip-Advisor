import { z } from 'zod';

export const TimeOfDayEnum = z.enum(['morning', 'afternoon', 'evening']);
export type TimeOfDay = z.infer<typeof TimeOfDayEnum>;

export const ActivityBlockSchema = z.object({
  timeOfDay: TimeOfDayEnum,
  title: z.string().min(1).max(120),
  place: z.string().min(1).max(120),
  description: z.string().min(1).max(600),
  estimatedCost: z.string().max(40).optional(),
  durationMinutes: z.number().int().positive().max(720).optional(),
});
export type ActivityBlock = z.infer<typeof ActivityBlockSchema>;

export const DayPlanSchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1).max(120),
  blocks: z.array(ActivityBlockSchema).min(1).max(5),
});
export type DayPlan = z.infer<typeof DayPlanSchema>;

export const ItinerarySchema = z.object({
  destination: z.string().min(1).max(120),
  summary: z.string().min(1).max(400),
  days: z.array(DayPlanSchema).min(1).max(14),
});
export type Itinerary = z.infer<typeof ItinerarySchema>;

export const TripSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  destination: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  itinerary: ItinerarySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Trip = z.infer<typeof TripSchema>;

export const GenerateItineraryRequestSchema = z.object({
  destination: z.string().min(1).max(120),
  days: z.number().int().min(1).max(14),
  vibe: z.string().max(400).optional(),
});
export type GenerateItineraryRequest = z.infer<typeof GenerateItineraryRequestSchema>;

export const RecommendationSchema = z.object({
  destination: z.string(),
  country: z.string(),
  blurb: z.string().max(280),
  reason: z.string().max(200),
  tags: z.array(z.string()).max(6),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

export const RecommendationsResponseSchema = z.object({
  recommendations: z.array(RecommendationSchema).min(1).max(8),
});
export type RecommendationsResponse = z.infer<typeof RecommendationsResponseSchema>;
