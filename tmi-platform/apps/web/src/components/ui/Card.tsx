export default function Card({ children }) {
  return (
    <div
      style={{
        background: "#050505",
        border: "1px solid cyan",
        padding: "20px",
        marginBottom: "20px",
        color: "white",
      }}
    >
      {children}
    </div>
  );
}
