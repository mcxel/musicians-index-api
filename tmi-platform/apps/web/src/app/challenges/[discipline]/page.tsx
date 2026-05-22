import { redirect } from 'next/navigation';

export default function ChallengeDisciplinePage({ params }: { params: { discipline: string } }) {
  redirect(`/challenges?discipline=${params.discipline}`);
}
