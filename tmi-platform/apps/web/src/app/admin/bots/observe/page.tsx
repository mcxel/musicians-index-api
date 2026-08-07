import ObservatoryLiveSwitcher from "@/components/admin/overseer/ObservatoryLiveSwitcher";

/** Full-page observer — same in-place dual POV + activity as Overseer surround slots. */
export default function AdminBotObservePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff" }}>
      <ObservatoryLiveSwitcher mode="full" />
    </main>
  );
}
