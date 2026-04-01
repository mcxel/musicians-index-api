export default function ArticleParagraph({ text }: { text: string }) {
  return (
    <p style={{ marginBottom: "20px", lineHeight: "1.6" }}>
      {text}
    </p>
  );
}
