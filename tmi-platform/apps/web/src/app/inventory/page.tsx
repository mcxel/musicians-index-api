import Link from "next/link";

const inventoryRoutes = [
  "/inventory/cosmetics",
  "/inventory/props",
  "/inventory/emotes",
  "/inventory/tickets",
  "/inventory/nfts",
];

export default function InventoryHubPage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(165deg, #090412, #1a1030 45%, #080510)", padding: 20 }}>
      <section style={{ maxWidth: 900, margin: "0 auto", border: "1px solid #5d3f86", borderRadius: 18, background: "#140c21", padding: 20 }}>
        <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 2 }}>Phase C2</div>
        <h1 style={{ color: "#f6eeff", margin: "4px 0 10px", fontSize: 30 }}>Inventory Route Hub</h1>
        <p style={{ color: "#d3c3ea", marginTop: 0, fontSize: 14 }}>
          Category lanes for cosmetics, props, emotes, tickets, and NFT inventory.
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {inventoryRoutes.map((route) => (
            <Link
              key={route}
              href={route}
              style={{
                display: "block",
                borderRadius: 10,
                border: "1px solid #6b4b98",
                background: "#1a1029",
                color: "#f3eaff",
                textDecoration: "none",
                padding: 12,
              }}
            >
              {route}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
