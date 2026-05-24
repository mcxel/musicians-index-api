import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OverseerClientPage from './OverseerClientPage';

export default function AdminOverseerPage() {
  const role = cookies().get('tmi_role')?.value;

  if (role !== 'ADMIN') {
    redirect('/home/1');
  }

  return <OverseerClientPage />;
}
