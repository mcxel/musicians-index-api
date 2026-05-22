import type { Metadata } from 'next';
import JoinPageClient from './JoinPageClient';

export const metadata: Metadata = {
  title: "Join The Musician's Index — Go Live. Compete. Earn.",
  description: "Free to join. Perform live, vote in battles, sponsor artists, or advertise. The Musician's Index is the global stage for every talent.",
};

export default function JoinPage() {
  return <JoinPageClient />;
}
