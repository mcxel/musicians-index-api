"use client";

import React, { useState } from "react";

const BANNED = ["spamword", "badword"];

export function ChatBubbleArea() {
  const [messages, setMessages] = useState<string[]>(["Welcome to the bar stage!"]);
  const [text, setText] = useState("");

  function send() {
    const lowered = text.toLowerCase();
    if (BANNED.some((w) => lowered.includes(w))) {
      setMessages((m) => [...m, "[Message flagged by moderation]"]);
      try { sessionStorage.setItem('bb_latest_chat', '[Message flagged by moderation]'); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('bb:chat:latest', { detail: { text: '[Message flagged by moderation]' } })); } catch (e) {}
    } else if (text.trim()) {
      setMessages((m) => [...m, text.trim()]);
      try { sessionStorage.setItem('bb_latest_chat', text.trim()); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('bb:chat:latest', { detail: { text: text.trim() } })); } catch (e) {}
    }
    setText("");
  }

  return (
    <div className="bg-gray-900 p-3 rounded">
      <div className="h-28 overflow-y-auto mb-2 space-y-1 text-sm">
        {messages.map((m, i) => {
          // Ensure banned words are not rendered raw; if message contains banned terms, show safe placeholder
          const lowered = (m || '').toLowerCase();
          const flagged = BANNED.some((w) => lowered.includes(w));
          const display = flagged ? '[Message flagged by moderation]' : m;
          return (
            <div key={i} className="bg-black/30 px-2 py-1 rounded text-gray-100">{display}</div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something..." className="flex-1 px-2 py-1 rounded bg-black/20" />
        <button onClick={send} className="px-3 py-1 bg-blue-600 rounded">Send</button>
      </div>
    </div>
  );
}
