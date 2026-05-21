"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface LawBubbleWidgetProps {
  userId: string;
  fullPage?: boolean;
}

export function LawBubbleWidget({ userId, fullPage = false }: LawBubbleWidgetProps) {
  const [isOpen, setIsOpen] = useState(fullPage);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch(`/api/law-bubble/wallet?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json() as { balance: number };
        setCredits(data.balance);
      }
    } catch {
      // non-blocking
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) void fetchCredits();
  }, [isOpen, fetchCredits]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const askQuestion = async () => {
    const q = question.trim();
    if (!q || isStreaming) return;
    if (credits !== null && credits <= 0) {
      setShowBuyCredits(true);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/law-bubble/ask-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, question: q }),
      });

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const token = line.slice(6);
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last?.role === "assistant") {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + token,
                };
              }
              return updated;
            });
          }
        }
      }

      // Deduct credit
      await fetch(`/api/law-bubble/wallet?action=deduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: 1 }),
      });
      setCredits((c) => (c !== null ? Math.max(0, c - 1) : null));
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "Error connecting to Law Bubble. Please try again." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const purchaseCredits = async (packageId: "starter" | "standard" | "pro") => {
    const packages = { starter: 5, standard: 12, pro: 25 };
    try {
      const res = await fetch(`/api/law-bubble/wallet?action=purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, packageId }),
      });
      if (res.ok) {
        const data = await res.json() as { balance: number };
        setCredits(data.balance);
        setShowBuyCredits(false);
      }
    } catch {
      // non-blocking
    }
  };

  if (!isOpen && !fullPage) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          background: "#4f46e5",
          color: "#fff",
          border: "none",
          borderRadius: "9999px",
          padding: "0.75rem 1.25rem",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(79,70,229,0.4)",
        }}
      >
        ⚖️ Law Bubble
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: fullPage ? "70vh" : 420,
        maxWidth: fullPage ? "100%" : 360,
        border: "1px solid #2a2a3f",
        borderRadius: "0.75rem",
        background: "#0d0d1a",
        overflow: "hidden",
        ...(fullPage ? {} : {
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }),
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "0.75rem 1rem",
          background: "#1a1a2e",
          borderBottom: "1px solid #2a2a3f",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>⚖️ Law Bubble</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {credits !== null && (
            <span
              style={{
                fontSize: "0.78rem",
                color: credits > 0 ? "#60a5fa" : "#f87171",
                cursor: "pointer",
              }}
              onClick={() => setShowBuyCredits(true)}
            >
              {credits} credit{credits !== 1 ? "s" : ""}
            </span>
          )}
          {!fullPage && (
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "#606070", cursor: "pointer", fontSize: "1.1rem" }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Buy Credits Panel */}
      {showBuyCredits && (
        <div
          style={{
            padding: "1rem",
            background: "#111122",
            borderBottom: "1px solid #2a2a3f",
          }}
        >
          <p style={{ fontSize: "0.82rem", color: "#c0c0d0", marginTop: 0 }}>
            Buy credits to ask questions:
          </p>
          {(["starter", "standard", "pro"] as const).map((pkg) => {
            const labels = { starter: "5 credits — $5", standard: "12 credits — $10", pro: "25 credits — $20" };
            return (
              <button
                key={pkg}
                onClick={() => void purchaseCredits(pkg)}
                style={{
                  display: "block",
                  width: "100%",
                  margin: "0.25rem 0",
                  padding: "0.5rem 0.75rem",
                  background: "#1e1e3f",
                  border: "1px solid #4f46e5",
                  borderRadius: "0.4rem",
                  color: "#c0c0f0",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  textAlign: "left",
                }}
              >
                {labels[pkg]}
              </button>
            );
          })}
          <button
            onClick={() => setShowBuyCredits(false)}
            style={{ marginTop: "0.5rem", background: "none", border: "none", color: "#606070", cursor: "pointer", fontSize: "0.8rem" }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem 1rem" }}>
        {messages.length === 0 && (
          <p style={{ color: "#505060", fontSize: "0.82rem", textAlign: "center", marginTop: "2rem" }}>
            Ask any legal question. Topics: contracts, employment, tenant rights, DMCA, and more.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: "0.75rem",
              padding: "0.6rem 0.85rem",
              borderRadius: "0.5rem",
              fontSize: "0.85rem",
              lineHeight: 1.55,
              background:
                msg.role === "user"
                  ? "#1e1e4f"
                  : msg.role === "system"
                  ? "#2a1020"
                  : "#141428",
              color:
                msg.role === "system" ? "#f87171" : "#e0e0f0",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.content || (isStreaming && msg.role === "assistant" ? "▌" : "")}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "0.75rem",
          borderTop: "1px solid #2a2a3f",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void askQuestion(); }}
          placeholder="Ask a legal question..."
          disabled={isStreaming}
          style={{
            flex: 1,
            padding: "0.5rem 0.75rem",
            background: "#1a1a2e",
            border: "1px solid #2a2a3f",
            borderRadius: "0.4rem",
            color: "#e0e0f0",
            fontSize: "0.85rem",
            outline: "none",
          }}
        />
        <button
          onClick={() => void askQuestion()}
          disabled={isStreaming || !question.trim()}
          style={{
            padding: "0.5rem 0.9rem",
            background: "#4f46e5",
            border: "none",
            borderRadius: "0.4rem",
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
            opacity: isStreaming || !question.trim() ? 0.5 : 1,
          }}
        >
          Ask
        </button>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          padding: "0.4rem 1rem",
          background: "#0a0a14",
          fontSize: "0.68rem",
          color: "#404050",
          borderTop: "1px solid #1a1a2a",
        }}
      >
        Not legal advice. For representation, consult a licensed attorney.
      </div>
    </div>
  );
}

export default LawBubbleWidget;
