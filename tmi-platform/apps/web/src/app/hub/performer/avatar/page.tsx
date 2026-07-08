import AvatarBuilder from "@/components/avatar/AvatarBuilder";

export default function PerformerAvatarHubPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "24px" }}>
      <AvatarBuilder
        initialSlug="tiana"
        surfaceLabel="Performer Hub"
        routeLinks={[
          { label: "Profile Avatar", href: "/profile/performer/avatar" },
          { label: "World Dance Party", href: "/world-dance-party" },
          { label: "Go Live", href: "/go-live" },
        ]}
      />
    </main>
  );
}