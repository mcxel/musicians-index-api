export default function ArtistHeader() {
  return (
    <div
      style={{
        border: "1px solid cyan",
        padding: "20px",
        marginBottom: "20px",
        background: "#050505",
      }}
    >
      <div style={{ display: "flex", gap: "20px" }}>
        <div
          style={{
            width: "120px",
            height: "120px",
            background: "#111",
          }}
        />

        <div>
          <h2>Artist Name</h2>
          <p>Genre • Rank • Location</p>
        </div>
      </div>
    </div>
  );
}
