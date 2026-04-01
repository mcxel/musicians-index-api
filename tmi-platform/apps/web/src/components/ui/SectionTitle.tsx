export default function SectionTitle({ title }: { title: string }) {
  return (
    <h2
      style={{
        fontSize: "24px",
        marginBottom: "15px",
        borderBottom: "1px solid cyan",
        paddingBottom: "5px",
      }}
    >
      {title}
    </h2>
  );
}
