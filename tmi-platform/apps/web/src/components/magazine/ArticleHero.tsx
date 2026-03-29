export default function ArticleHero({ title }) {
  return (
    <div style={{ marginBottom: "30px" }}>
      <h1 style={{ fontSize: "40px", marginBottom: "15px" }}>{title}</h1>
      <div
        style={{
          width: "100%",
          height: "300px",
          background: "#111",
        }}
      />
    </div>
  );
}
