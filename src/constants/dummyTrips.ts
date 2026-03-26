import { Trip } from '../types';

export const dummyTrips: Trip[] = [
  {
    id: '1',
    customerName: 'Andi Wijaya',
    date: '2025-03-26',
    status: 'available',
    stops: [
      {
        id: 's1',
        type: 'PICKUP',
        address: 'Jl. Sudirman No. 123, Jakarta',
        completed: false,
        requiredLat: -6.2088,
        requiredLng: 106.8456,
      },
      {
        id: 's2',
        type: 'DROPOFF',
        address: 'Jl. Thamrin No. 45, Jakarta',
        completed: false,
        requiredLat: -6.1865,
        requiredLng: 106.8225,
      },
    ],
  },
  {
    id: '2',
    customerName: 'Andi Wijaya',
    date: '2025-03-27',
    status: 'available',
    stops: [
      {
        id: 's3',
        type: 'PICKUP',
        address: 'Jl. Gatot Subroto No. 78, Jakarta',
        completed: false,
        requiredLat: -6.2278,
        requiredLng: 106.8272,
      },
      {
        id: 's4',
        type: 'DROPOFF',
        address: 'Jl. Rasuna Said No. 90, Jakarta',
        completed: false,
        requiredLat: -6.2254,
        requiredLng: 106.8365,
      },
    ],
  },
];
