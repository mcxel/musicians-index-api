import StoreShowcaseRotator from "@/components/store/StoreShowcaseRotator";

type PrizeVaultTileProps = {
  title: string;
  amount: string;
  showStoreRotation?: boolean;
};

export default function PrizeVaultTile({ title, amount, showStoreRotation = false }: PrizeVaultTileProps) {
  return (
    <article style={{ borderRadius: 12, border: "1px solid rgba(250,204,21,0.45)", background: "rgba(44,29,5,0.78)", padding: 12, display: "grid", gap: 4 }}>
      <div style={{ fontSize: 10, color: "#fde68a", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>Prize Vault</div>
      <div style={{ fontSize: 14, color: "#fff", fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: 18, color: "#facc15", fontWeight: 900 }}>{amount}</div>
      {showStoreRotation ? (
        <div style={{ marginTop: 4, borderTop: "1px solid rgba(250,204,21,0.18)", paddingTop: 8 }}>
          <StoreShowcaseRotator compact maxItems={1} />
        </div>
      ) : null}
    </article>
  );
}
