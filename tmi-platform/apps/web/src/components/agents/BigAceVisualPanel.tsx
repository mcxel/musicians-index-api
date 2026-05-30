'use client';

import { useEffect, useRef, useState } from 'react';
import { AgentRegistry, type AgentEntity } from '@/stubs/bernout-agent-network';

type AgentState = 'idle' | 'thinking' | 'speaking' | 'listening';

interface ChatMessage {
  role: 'agent' | 'user';
  text: string;
}

const STATE_EMOJI: Record<AgentState, string> = {
  idle: '😎',
  thinking: '🤔',
  speaking: '🎤',
  listening: '👂',
};

const STATE_COLOR: Record<AgentState, string> = {
  idle:      '#00FFFF',
  thinking:  '#AA2DFF',
  speaking:  '#FF2DAA',
  listening: '#00FF88',
};

const MEMORY_KEY = 'big-ace-memory';

function loadLocalMemory(): Record<string, string> {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveLocalMemory(data: Record<string, string>): void {
  try { localStorage.setItem(MEMORY_KEY, JSON.stringify(data)); } catch { /* noop */ }
}

export default function BigAceVisualPanel() {
  const [agent, setAgent] = useState<AgentEntity | null>(null);
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [memory, setMemory] = useState<Record<string, string>>({});
  const [heartbeat, setHeartbeat] = useState(0);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAgent(AgentRegistry.get('big-ace') ?? null);
    const mem = loadLocalMemory();
    setMemory(mem);
    if (Object.keys(mem).length > 0) {
      setMessages([{ role: 'agent', text: `Memory loaded — ${Object.keys(mem).length} fact${Object.keys(mem).length !== 1 ? 's' : ''} on file.` }]);
    } else {
      setMessages([{ role: 'agent', text: "Hey! Big Ace in the building. Tell me something — I'll remember it." }]);
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeartbeat((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    setAgentState('listening');
    setMessages((m) => [...m, { role: 'user', text }]);

    setTimeout(() => setAgentState('thinking'), 300);

    try {
      const res = await fetch('/api/agents/big-ace/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json() as { reply?: string; newFacts?: Record<string, string> };
      const reply = data.reply ?? 'Big Ace hears you.';
      setAgentState('speaking');
      setMessages((m) => [...m, { role: 'agent', text: reply }]);
      if (data.newFacts && Object.keys(data.newFacts).length > 0) {
        const updated = { ...memory, ...data.newFacts };
        setMemory(updated);
        saveLocalMemory(updated);
        AgentRegistry.setCheckpoint('big-ace', 'Memory Read/Write', true);
      }
      AgentRegistry.setCheckpoint('big-ace', 'Chat Replies', true);
    } catch {
      setMessages((m) => [...m, { role: 'agent', text: 'Connection glitch — I heard you though.' }]);
    } finally {
      setSending(false);
      setTimeout(() => setAgentState('idle'), 2200);
    }
  }

  const color = STATE_COLOR[agentState];
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ background: 'rgba(5,5,16,0.96)', border: `1px solid ${color}30`, borderRadius: 14, overflow: 'hidden', fontFamily: "'Inter',sans-serif" }}>

      {/* Keyframes */}
      <style>{`
        @keyframes baBreath { 0%,100%{transform:scale(1);opacity:.9} 50%{transform:scale(1.04);opacity:1} }
        @keyframes baThink  { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes baSpeak  { 0%,100%{box-shadow:0 0 20px #FF2DAA30} 50%{box-shadow:0 0 50px #FF2DAA80} }
        @keyframes baRing   { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.2);opacity:0} }
      `}</style>

      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color, textTransform: 'uppercase' }}>Big Ace</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
            GLOBAL PERSONAL ASSISTANT · Reports to: Marcel · {agent?.currentAssignment?.toUpperCase() ?? 'BERNOUTGLOBAL'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 8px #00FF88' }} />
          <span style={{ fontSize: 9, fontWeight: 900, color: '#00FF88', letterSpacing: '0.1em' }}>ONLINE</span>
        </div>
      </div>

      {/* Avatar Stage */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ position: 'relative', width: 100, height: 100 }}>
          {/* Pulse ring */}
          {agentState === 'speaking' && (
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `2px solid ${color}`, animation: 'baRing 1s ease-out infinite' }} />
          )}
          {/* Avatar circle */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: `radial-gradient(circle at 40% 35%, ${color}22, rgba(5,5,16,0.9))`,
            border: `2px solid ${color}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
            animation: agentState === 'idle' ? 'baBreath 3.5s ease-in-out infinite'
                      : agentState === 'thinking' ? 'baThink 2s linear infinite'
                      : agentState === 'speaking' ? 'baSpeak 0.6s ease-in-out infinite'
                      : 'baBreath 1.2s ease-in-out infinite',
          }}>
            {STATE_EMOJI[agentState]}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 900, color, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{agentState}</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Heartbeat {fmt(heartbeat)}</span>
          <span style={{ fontSize: 9, color: Object.keys(memory).length > 0 ? '#00FF88' : 'rgba(255,255,255,0.25)' }}>
            {Object.keys(memory).length > 0 ? `Memory: ${Object.keys(memory).length} facts` : 'Memory: empty'}
          </span>
        </div>
      </div>

      {/* Chat feed */}
      <div style={{ maxHeight: 160, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(0,0,0,0.2)' }}>
        {messages.slice(-6).map((m, i) => (
          <div key={i} style={{ fontSize: 11, color: m.role === 'agent' ? '#fff' : 'rgba(255,255,255,0.65)', display: 'flex', gap: 6 }}>
            <span style={{ fontWeight: 900, color: m.role === 'agent' ? color : 'rgba(255,255,255,0.4)', flexShrink: 0, fontSize: 10 }}>
              {m.role === 'agent' ? 'Big Ace' : 'You'}:
            </span>
            {m.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void send(); }}
          placeholder="Talk to Big Ace…"
          disabled={sending}
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}25`, borderRadius: 7, padding: '7px 10px', color: '#fff', fontSize: 11, outline: 'none' }}
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={sending || !input.trim()}
          style={{ background: `${color}20`, border: `1px solid ${color}45`, borderRadius: 7, padding: '7px 12px', color, fontWeight: 900, fontSize: 10, letterSpacing: '0.08em', cursor: 'pointer', opacity: sending || !input.trim() ? 0.4 : 1 }}
        >
          {sending ? '…' : 'SEND'}
        </button>
      </div>
    </div>
  );
}
