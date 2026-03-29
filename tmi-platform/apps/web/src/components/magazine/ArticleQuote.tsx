export default function ArticleQuote({ text }) {
  return (
    <div
      style={{
        borderLeft: "3px solid cyan",
        paddingLeft: "15px",
        margin: "30px 0",
        fontStyle: "italic",
      }}
    >
      {text}
    </div>
  );
}
