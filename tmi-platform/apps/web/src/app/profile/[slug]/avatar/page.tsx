import AvatarBuilder from "@/components/avatar/AvatarBuilder";

type ProfileAvatarPageProps = {
  params: { slug: string };
};

export default function ProfileAvatarPage({ params }: ProfileAvatarPageProps) {
  const slug = params.slug;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "24px" }}>
      <AvatarBuilder
        initialSlug={slug}
        profileSlug={slug}
        surfaceLabel="Profile Avatar"
        routeLinks={[
          { label: "Profile", href: `/profile/${slug}` },
          { label: "World Dance Party", href: "/world-dance-party" },
          { label: "Live Room", href: "/live/rooms/world-dance-party" },
        ]}
      />
    </main>
  );
}