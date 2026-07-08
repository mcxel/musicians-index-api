import AvatarBuilder from "@/components/avatar/AvatarBuilder";

export default function FanAvatarHubPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "24px" }}>
      <AvatarBuilder
        initialSlug="bebo"
        surfaceLabel="Fan Hub"
        routeLinks={[
          { label: "Profile Avatar", href: "/profile/fan/avatar" },
          { label: "World Dance Party", href: "/world-dance-party" },
          { label: "Live Rooms", href: "/live/rooms" },
        ]}
      />
    </main>
  );
}