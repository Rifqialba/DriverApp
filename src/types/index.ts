export type Stop = {
  id: string;
  type: 'PICKUP' | 'DROPOFF';
  address: string;
  completed: boolean;
  requiredLat?: number;
  requiredLng?: number;
  photoUri?: string;      // setelah ambil foto
  gpsConfirmed?: boolean; // setelah konfirmasi GPS
};

export type Trip = {
  id: string;
  customerName: string;
  date: string;
  stops: Stop[];
  status: 'available' | 'in_progress' | 'completed';
};