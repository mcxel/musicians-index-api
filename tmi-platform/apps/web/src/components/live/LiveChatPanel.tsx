'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  color: string;
  isTip?: boolean;
  amount?: number;
}

export default function LiveChatPanel({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Simulated live chat feed
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const isTip = Math.random() > 0.8;
        setMessages(prev => [...prev.slice(-49), {
          id: Date.now().toString(),
          user: `Fan_${Math.floor(Math.random() * 9999)}`,
          text: isTip ? 'Sent a tip!' : ['🔥', 'Let\'s gooo', 'Crown him 👑', 'Bars!', 'Drop the beat 🎧'][Math.floor(Math.random() * 5)],
          color: ['#00FFFF', '#FF2DAA', '#FFD700', '#00FF88'][Math.floor(Math.random() * 4)],
          isTip,
          amount: isTip ? Math.floor(Math.random() * 50) + 5 : undefined
        }]);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: 'You',
      text: input,
      color: '#AA2DFF'
    }]);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(5,5,16,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: '#00FFFF', letterSpacing: '0.15em' }}>LIVE CHAT</span>
        <span style={{ fontSize: 10, color: '#FF2DAA', fontWeight: 900 }}>● {roomId.toUpperCase()}</span>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, scrollbarWidth: 'none' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ 
            background: msg.isTip ? 'linear-gradient(90deg, rgba(255,215,0,0.15), rgba(255,149,0,0.05))' : 'transparent', 
            border: msg.isTip ? '1px solid rgba(255,215,0,0.3)' : 'none',
            padding: msg.isTip ? '8px 12px' : '2px 0',
            borderRadius: 6,
            animation: 'h1StickerPop 0.3s ease-out'
          }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: msg.color, marginRight: 8 }}>{msg.user}</span>
            <span style={{ fontSize: 12, color: msg.isTip ? '#FFD700' : 'rgba(255,255,255,0.8)', fontWeight: msg.isTip ? 700 : 400 }}>
              {msg.text} {msg.isTip && <strong style={{ marginLeft: 4 }}>${msg.amount}</strong>}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '12px', background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700', borderRadius: 6, padding: '0 12px', cursor: 'pointer', fontWeight: 900 }}>$</button>
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Send a message..." 
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 12px', color: '#fff', outline: 'none', fontSize: 12 }} 
          />
          <button type="submit" style={{ background: '#AA2DFF', color: '#fff', border: 'none', borderRadius: 6, padding: '0 16px', fontWeight: 900, cursor: 'pointer' }}>SEND</button>
        </form>
      </div>
    </div>
  );
}