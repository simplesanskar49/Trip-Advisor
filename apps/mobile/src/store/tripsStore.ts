import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Itinerary } from '@trip/schemas';
import { zustandStorage } from '@/lib/storage';

export type SavedTrip = {
  id: string;
  destination: string;
  itinerary: Itinerary;
  coverImageUrl?: string;
  createdAt: number;
};

type TripsState = {
  trips: SavedTrip[];
  addTrip: (itinerary: Itinerary, coverImageUrl?: string) => SavedTrip;
  removeTrip: (id: string) => void;
  updateItinerary: (id: string, itinerary: Itinerary) => void;
  getTrip: (id: string) => SavedTrip | undefined;
};

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useTripsStore = create<TripsState>()(
  persist(
    (set, get) => ({
      trips: [],
      addTrip: (itinerary, coverImageUrl) => {
        const trip: SavedTrip = {
          id: newId(),
          destination: itinerary.destination,
          itinerary,
          coverImageUrl,
          createdAt: Date.now(),
        };
        set((s) => ({ trips: [trip, ...s.trips] }));
        return trip;
      },
      removeTrip: (id) => set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),
      updateItinerary: (id, itinerary) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === id ? { ...t, itinerary, destination: itinerary.destination } : t,
          ),
        })),
      getTrip: (id) => get().trips.find((t) => t.id === id),
    }),
    {
      name: 'trips-v1',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
