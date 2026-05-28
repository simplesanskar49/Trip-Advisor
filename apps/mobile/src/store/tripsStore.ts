import { zustandStorage } from '@/lib/storage';
import type { Itinerary } from '@trip/schemas';
import { geocodeDestination } from '@trip/ui-core';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SavedTrip = {
  id: string;
  destination: string;
  itinerary: Itinerary;
  coverImageUrl?: string;
  lat?: number;
  lng?: number;
  createdAt: number;
};

type TripsState = {
  trips: SavedTrip[];
  addTrip: (itinerary: Itinerary, coverImageUrl?: string) => SavedTrip;
  removeTrip: (id: string) => void;
  updateItinerary: (id: string, itinerary: Itinerary) => void;
  setCoords: (id: string, lat: number, lng: number) => void;
  getTrip: (id: string) => SavedTrip | undefined;
};

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

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
        geocodeDestination(itinerary.destination).then((coords) => {
          if (coords) get().setCoords(trip.id, coords.lat, coords.lng);
        });
        return trip;
      },
      removeTrip: (id) => set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),
      setCoords: (id, lat, lng) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === id ? { ...t, lat, lng } : t)),
        })),
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
