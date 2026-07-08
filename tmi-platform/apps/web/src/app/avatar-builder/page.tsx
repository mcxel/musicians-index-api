import AvatarBuilder from "@/components/avatar/AvatarBuilder";

export default function AvatarBuilderPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "24px" }}>
      <AvatarBuilder
        initialSlug="bebo"
        surfaceLabel="Avatar Builder"
        routeLinks={[
          { label: "Fan Avatar Hub", href: "/hub/fan/avatar" },
          { label: "Performer Avatar Hub", href: "/hub/performer/avatar" },
          { label: "World Dance Party", href: "/world-dance-party" },
        ]}
      />
    </main>
  );
}
