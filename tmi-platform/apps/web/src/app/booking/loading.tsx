export default function BookingLoading() {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        background: "radial-gradient(ellipse at top, #0a1a0a 0%, #050510 60%)",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.3em",
          color: "#00FF88",
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        Loading Booking...
      </div>
    </div>
  );
}
