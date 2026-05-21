import AdvertiserHub from "@/components/advertisers/AdvertiserHub";

export default function Page({ params }: { params: { slug: string } }) {
  return <AdvertiserHub slug={params.slug} />;
}