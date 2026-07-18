export interface Booking {
  id: string;
  venueName: string;
  city: string;
  date: string;
  time: string;
  fee: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  contact: string;
  notes: string;
  isVirtual: boolean;
}

export interface MonthlyEarning {
  month: string;
  shows: number;
  gross: number;
}

export const mockBookings: Booking[] = [
  { id: 'b1', venueName: 'CLUB APEX ATL', city: 'Atlanta, GA', date: '2026-06-07', time: '10:00 PM', fee: 1200, status: 'confirmed', contact: 'apex@bookings.io', notes: '90-min set. PA included.', isVirtual: false },
  { id: 'b2', venueName: 'THE SUMMIT NYC', city: 'New York, NY', date: '2026-06-14', time: '9:30 PM', fee: 2500, status: 'pending', contact: 'summit@venues.com', notes: 'Needs setlist by June 1.', isVirtual: false },
  { id: 'b3', venueName: 'TMI VIRTUAL ARENA', city: 'Global WebRTC', date: '2026-06-21', time: '11:00 PM', fee: 900, status: 'confirmed', contact: 'live@tmi.com', notes: 'Virtual stage. Requires hardware check.', isVirtual: true },
  { id: 'b4', venueName: 'FREQUENCY LA', city: 'Los Angeles, CA', date: '2026-05-31', time: '8:00 PM', fee: 1800, status: 'completed', contact: 'freq@laevents.com', notes: 'Paid. Receipt sent.', isVirtual: false },
  { id: 'b5', venueName: 'CYPHER HALL MIA', city: 'Miami, FL', date: '2026-05-18', time: '9:00 PM', fee: 600, status: 'cancelled', contact: 'cypher@miami.com', notes: 'Venue closed due to flood.', isVirtual: false },
  { id: 'b6', venueName: 'PALACE STAGE HOU', city: 'Houston, TX', date: '2026-07-04', time: '7:30 PM', fee: 3200, status: 'pending', contact: 'palace@houston.io', notes: 'Holiday weekend — premium slot.', isVirtual: false },
];

export const mockEarnings: MonthlyEarning[] = [
    { month: 'MAR 2026', shows: 2, gross: 2100 },
    { month: 'APR 2026', shows: 3, gross: 3400 },
    { month: 'MAY 2026', shows: 4, gross: 4200 },
];

export const bookingStatusMap = {
    pending: { color: '#FFD700', label: 'PENDING' },
    confirmed: { color: '#00C8FF', label: 'CONFIRMED' },
    cancelled: { color: '#FF4444', label: 'CANCELLED' },
    completed: { color: '#00C896', label: 'PAID ✓' },
};