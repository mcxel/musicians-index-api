'use client';

import { useEffect, useRef, useState } from 'react';
import { AgentRegistry, type AgentEntity } from '@/stubs/bernout-agent-network';

type Priority = 'low' | 'normal' | 'high' | 'critical';

interface TaskEntry {
  taskId: string;
  agentId: string;
  agentName: string;
  command: string;
  reply: string;
  priority: Priority;
  timestamp: string;
}

interface CommandResponse {
  taskId: string;
  agentId: string;
  agentName: string;
  reply: string;
  priority: Priority;
  status: string;
  timestamp: string;
}

const PRIORITY_COLOR: Record<Priority, string> = {
  low: 'rgba(255,255,255,0.3)',
  normal: '#00FFFF',
  high: '#FFD700',
  critical: '#FF2DAA',
};

const QUICK_COMMANDS = [
  { label: 'Revenue health', command: 'Revenue health check', agent: 'big-ace' },
  { label: 'Stripe status', command: 'Stripe status', agent: 'big-ace' },
  { label: 'Database status', command: 'Database status', agent: 'big-ace' },
  { label: 'Business report', command: 'Business status report', agent: 'big-ace' },
  { label: 'Check rooms', command: 'Check all rooms', agent: 'michael-charlie' },
  { label: 'Homepage status', command: 'Homepage status', agent: 'michael-charlie' },
  { label: 'Launch gates', command: 'Launch checkpoint status', agent: 'michael-charlie' },
  { label: 'Bot health', command: 'Bot health check', agent: 'michael-charlie' },
];

export default function AgentCommandCenter() {
  const [bigAce, setBigAce] = useState<AgentEntity | null>(null);
  const [michaelCharlie, setMichaelCharlie] = useState<AgentEntity | null>(null);
  const [command, setCommand] = useState('');
  const [agentTarget, setAgentTarget] = useState<'auto' | 'big-ace' | 'michael-charlie'>('auto');
  const [priority, setPriority] = useState<Priority>('normal');
  const [log, setLog] = useState<TaskEntry[]>([]);
  const [sending, setSending] = useState(false);
  const [tick, setTick] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBigAce(AgentRegistry.get('big-ace') ?? null);
    setMichaelCharlie(AgentRegistry.get('michael-charlie') ?? null);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setBigAce(AgentRegistry.get('big-ace') ?? null);
      setMichaelCharlie(AgentRegistry.get('michael-charlie') ?? null);
      setTick((s) => s + 1);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  async function dispatch(cmd: string, targetAgent?: string) {
    const text = cmd.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/agents/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: text, agentId: targetAgent ?? agentTarget, priority }),
      });
      const data = await res.json() as CommandResponse;
      setLog((prev) => [...prev, {
        taskId: data.taskId,
        agentId: data.agentId,
        agentName: data.agentName,
        command: text,
        reply: data.reply,
        priority: data.priority,
        timestamp: data.timestamp,
      }]);
    } catch {
      setLog((prev) => [...prev, {
        taskId: `ERR-${Date.now()}`,
        agentId: 'system',
        agentName: 'System',
        command: text,
        reply: 'Connection error — agents unreachable.',
        priority,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  }

  function sendCommand() {
    void dispatch(command);
    setCommand('');
  }

  const fmtTime = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    catch { return '--:--:--'; }
  };

  const agentColor = (id: string) =>
    id === 'big-ace' ? '#00FFFF' : id === 'michael-charlie' ? '#00FF88' : 'rgba(255,255,255,0.4)';

  return (
    <div style={{ background: 'rgba(5,5,16,0.97)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 14, overflow: 'hidden', fontFamily: "'Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,215,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,215,0,0.03)' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: '#FFD700', textTransform: 'uppercase' }}>Mission Control</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>BernoutGlobal · Agent Command Center · Marcel → Big Ace → Michael Charlie</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {[bigAce, michaelCharlie].filter(Boolean).map((a) => a && (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 6px #00FF88' }} />
              <span style={{ fontSize: 8, fontWeight: 900, color: agentColor(a.id), letterSpacing: '0.1em' }}>{a.name.split(' ')[0]?.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Status Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {[bigAce, michaelCharlie].map((a, i) => a && (
          <div key={a.id} style={{ padding: '10px 14px', background: i === 0 ? 'rgba(0,255,255,0.03)' : 'rgba(0,255,136,0.03)', borderRight: i === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.15em', color: agentColor(a.id), marginBottom: 3 }}>{a.name.toUpperCase()}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{a.role} · {a.health}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
              {a.reportsTo ? `Reports to: ${a.reportsTo}` : 'No superior'} · {a.currentAssignment?.toUpperCase()}
            </div>
            <div style={{ marginTop: 6, fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
              {a.checkpoints.filter((c) => c.passed).length}/{a.checkpoints.length} gates
            </div>
          </div>
        ))}
      </div>

      {/* Quick Commands */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', marginBottom: 7 }}>QUICK DISPATCH</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {QUICK_COMMANDS.map((qc) => (
            <button
              key={qc.label}
              type="button"
              disabled={sending}
              onClick={() => void dispatch(qc.command, qc.agent)}
              style={{
                background: qc.agent === 'big-ace' ? 'rgba(0,255,255,0.08)' : 'rgba(0,255,136,0.08)',
                border: `1px solid ${qc.agent === 'big-ace' ? 'rgba(0,255,255,0.25)' : 'rgba(0,255,136,0.25)'}`,
                borderRadius: 5,
                padding: '4px 9px',
                fontSize: 9,
                fontWeight: 700,
                color: qc.agent === 'big-ace' ? '#00FFFF' : '#00FF88',
                cursor: sending ? 'not-allowed' : 'pointer',
                opacity: sending ? 0.4 : 1,
                letterSpacing: '0.05em',
              }}
            >
              {qc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Command Input */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {/* Agent selector */}
          <select
            value={agentTarget}
            onChange={(e) => setAgentTarget(e.target.value as typeof agentTarget)}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 6, padding: '6px 8px', color: '#FFD700', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer' }}
          >
            <option value="auto">AUTO-ROUTE</option>
            <option value="big-ace">BIG ACE</option>
            <option value="michael-charlie">MICHAEL CHARLIE</option>
          </select>

          {/* Priority selector */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${PRIORITY_COLOR[priority]}40`, borderRadius: 6, padding: '6px 8px', color: PRIORITY_COLOR[priority], fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer' }}
          >
            <option value="low">LOW</option>
            <option value="normal">NORMAL</option>
            <option value="high">HIGH</option>
            <option value="critical">CRITICAL</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendCommand(); }}
            placeholder="Issue directive to Big Ace or Michael Charlie…"
            disabled={sending}
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 7, padding: '8px 11px', color: '#fff', fontSize: 11, outline: 'none' }}
          />
          <button
            type="button"
            onClick={sendCommand}
            disabled={sending || !command.trim()}
            style={{
              background: 'rgba(255,215,0,0.12)',
              border: '1px solid rgba(255,215,0,0.35)',
              borderRadius: 7,
              padding: '8px 14px',
              color: '#FFD700',
              fontWeight: 900,
              fontSize: 10,
              letterSpacing: '0.1em',
              cursor: sending || !command.trim() ? 'not-allowed' : 'pointer',
              opacity: sending || !command.trim() ? 0.4 : 1,
            }}
          >
            {sending ? '…' : 'DISPATCH'}
          </button>
        </div>
      </div>

      {/* Task Log */}
      <div style={{ maxHeight: 300, overflowY: 'auto', padding: '8px 0' }}>
        {log.length === 0 ? (
          <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
            No dispatches yet — issue a directive above
          </div>
        ) : (
          [...log].reverse().map((entry) => (
            <div
              key={entry.taskId}
              style={{ padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 8, fontWeight: 900, color: agentColor(entry.agentId), letterSpacing: '0.1em' }}>
                  {entry.agentName.toUpperCase()}
                </span>
                <span style={{ fontSize: 8, fontWeight: 700, color: PRIORITY_COLOR[entry.priority], letterSpacing: '0.08em' }}>
                  [{entry.priority.toUpperCase()}]
                </span>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
                  {entry.taskId}
                </span>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
                  {fmtTime(entry.timestamp)}
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 5, fontStyle: 'italic' }}>
                &ldquo;{entry.command}&rdquo;
              </div>
              <div style={{ fontSize: 11, color: '#fff', lineHeight: 1.5 }}>
                {entry.reply}
              </div>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
          {log.length} task{log.length !== 1 ? 's' : ''} dispatched this session
        </span>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em' }}>
          tick {tick}
        </span>
      </div>
    </div>
  );
}
