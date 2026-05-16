import Link from "next/link";

export default function NftCreatePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#090914", color: "#fff", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>NFT Lab Create</h1>
      <p style={{ opacity: 0.85 }}>
        Creator route is now active. Use this surface to start a new collectible workflow.
      </p>
      <Link href="/nft-lab" style={{ color: "#facc15" }}>Open NFT Lab</Link>
    </main>
  );
}
