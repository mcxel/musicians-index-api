"use client";

export default function NotFoundShell() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "Arial",
      }}
    >
      <h1>404</h1>
      <p>Page not found</p>
      <a href="/">Go Home</a>
    </div>
  );
}
