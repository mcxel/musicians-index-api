export default function ArtistsLoading() {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at top, #0d0018 0%, #050510 60%)",
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.3em",
          color: "#FF2DAA",
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        Loading Artists...
      </span>
    </div>
  );
}
