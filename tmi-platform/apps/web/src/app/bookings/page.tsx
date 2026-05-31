import { redirect } from 'next/navigation';

export default function BookingsPage() {
  redirect('/fan/theater?drawer=bookings');
}
