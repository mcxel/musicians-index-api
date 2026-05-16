import Link from "next/link";

const emotes = ["Dance Burst", "Clap Storm", "Crowd Hype", "Signature Wave"];

export default function InventoryEmotesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0e0818", padding: 20 }}>
      <section style={{ maxWidth: 860, margin: "0 auto", border: "1px solid #5d3f86", borderRadius: 16, background: "#150d23", padding: 20 }}>
        <h1 style={{ color: "#f4ebff", marginTop: 0 }}>Inventory Emotes</h1>
        <ul style={{ color: "#d4c3ea", lineHeight: 1.7 }}>
          {emotes.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
        <Link href="/inventory" style={{ color: "#bde7ff" }}>Back to inventory hub</Link>
      </section>
    </main>
  );
}
