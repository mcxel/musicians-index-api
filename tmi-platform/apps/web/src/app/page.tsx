import { permanentRedirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function RootPage() {
  permanentRedirect('/home/1');
}
