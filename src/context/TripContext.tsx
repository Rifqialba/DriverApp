import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Trip, Stop } from '../types';
import { dummyTrips } from '../constants/dummyTrips';

type TripContextType = {
  trips: Trip[];
  currentTripId: string | null;
  setCurrentTripId: (id: string | null) => void;
  startTrip: (tripId: string) => void;
  completeStop: (tripId: string, stopId: string, data: { photoUri?: string; gpsConfirmed?: boolean }) => void;
  completeTrip: (tripId: string) => void;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(dummyTrips);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);

  const startTrip = (tripId: string) => {
    setTrips(prev =>
      prev.map(trip =>
        trip.id === tripId ? { ...trip, status: 'in_progress' } : trip
      )
    );
    setCurrentTripId(tripId);
  };

  const completeStop = (tripId: string, stopId: string, data: { photoUri?: string; gpsConfirmed?: boolean }) => {
    setTrips(prev =>
      prev.map(trip => {
        if (trip.id !== tripId) return trip;
        const updatedStops = trip.stops.map(stop => {
          if (stop.id !== stopId) return stop;
          const updated = { ...stop, ...data };
          // Tandai stop selesai jika kedua aksi sudah dilakukan
          const isCompleted = !!(updated.photoUri && updated.gpsConfirmed);
          return { ...updated, completed: isCompleted };
        });
        // Cek apakah semua stop selesai
        const allCompleted = updatedStops.every(stop => stop.completed);
        const newStatus = allCompleted ? 'completed' : trip.status;
        return { ...trip, stops: updatedStops, status: newStatus };
      })
    );
    // Jika trip selesai, clear currentTripId
    const updatedTrip = trips.find(t => t.id === tripId);
    if (updatedTrip && updatedTrip.stops.every(s => s.completed)) {
      setCurrentTripId(null);
    }
  };

  const completeTrip = (tripId: string) => {
    setTrips(prev =>
      prev.map(trip =>
        trip.id === tripId ? { ...trip, status: 'completed' } : trip
      )
    );
    setCurrentTripId(null);
  };

  return (
    <TripContext.Provider
      value={{ trips, currentTripId, setCurrentTripId, startTrip, completeStop, completeTrip }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within TripProvider');
  return context;
};