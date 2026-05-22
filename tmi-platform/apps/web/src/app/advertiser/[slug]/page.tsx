import { redirect } from 'next/navigation';

export default function AdvertiserProfilePage({ params }: { params: { slug: string } }) {
  redirect(`/advertiser?brand=${params.slug}`);
}
