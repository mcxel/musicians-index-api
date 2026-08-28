export default function LiveLoading() {
  return (
    <main
      className="min-h-screen bg-[#050510] flex items-center justify-center"
      aria-label="Entering live room"
      data-live-loading="honest"
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.14em",
          color: "rgba(0,255,255,0.55)",
          textTransform: "uppercase",
        }}
      >
        Loading live room…
      </p>
    </main>
  );
}
