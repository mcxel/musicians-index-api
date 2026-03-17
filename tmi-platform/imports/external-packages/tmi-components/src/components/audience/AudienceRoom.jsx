/**
 * TMI — AUDIENCE ROOM COMPONENT
 * Matches PDF pages 7 & 15: Neon avatar tiles, live/queue states,
 * tip controls, reaction bar, chat overlay
 */
import React, { useState, useEffect } from 'react';
import './AudienceRoom.css';

const DEMO_AUDIENCE = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  name: `Fan${i + 1}`,
  status: i === 0 ? 'live' : i === 4 ? 'live' : i === 6 ? 'queue' : 'active',
  avatarColor: ['#FF6B00','#00D4FF','#FF1493','#FFB800','#00FF88','#D400FF'][i % 6],
  img: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=transparent`,
}));

const DEMO_CHAT = [
  { user: 'AnonMan', msg: 'YES!.D', color: '#00D4FF' },
  { user: 'Brandy21', msg: 'This is so much fun!', color: '#FF6B00' },
  { user: 'JayBeats', msg: '🔥🔥🔥', color: '#FF1493' },
  { user: 'LilaM', msg: 'when is the next show?', color: '#FFB800' },
];

function AudienceTile({ fan }) {
  return (
    <div className={`audience-tile audience-tile--${fan.status}`}>
      {fan.status === 'live' && <div className="audience-tile__live-dot" />}
      {fan.status === 'queue' && <div className="audience-tile__queue-label">QUEUE</div>}
      <div className="audience-tile__avatar"
        style={{ background: fan.avatarColor + '22', border: `2px solid ${fan.avatarColor}` }}>
        <span style={{ fontSize: '22px' }}>
          {['😎','🎤','🎵','🔥','👑','🎧','💫','🎪','⭐','🎸'][fan.id % 10]}
        </span>
      </div>
    </div>
  );
}

function ChatBubble({ msg }) {
  return (
    <div className="chat-bubble">
      <span className="chat-bubble__user" style={{ color: msg.color }}>{msg.user}</span>
      <span className="chat-bubble__msg">{msg.msg}</span>
    </div>
  );
}

export default function AudienceRoom({ audience = DEMO_AUDIENCE, chat = DEMO_CHAT }) {
  const [chat2, setChat2] = useState(chat);
  const [tipAmt, setTipAmt] = useState(5);

  useEffect(() => {
    const t = setInterval(() => {
      const emojis = ['🔥🔥', '💎', '🎉 yess!', '🎵 this is it!', '👑 king!'];
      const names = ['Wave23', 'NicoB', 'SkyF', 'Marco11'];
      const colors = ['#FF6B00','#00D4FF','#FF1493','#00FF88'];
      const idx = Math.floor(Math.random() * names.length);
      setChat2(prev => [
        ...prev.slice(-6),
        { user: names[idx], msg: emojis[Math.floor(Math.random()*emojis.length)], color: colors[idx%4] },
      ]);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="audience-room">
      {/* ── HEADER ── */}
      <div className="audience-room__header">
        <div className="audience-room__subtitle">BERNTOUTGLOBAL'S</div>
        <h1 className="audience-room__title">AUDIENCE ROOM</h1>
      </div>

      {/* ── AUDIENCE GRID + CHAT ── */}
      <div className="audience-room__body">
        {/* Tile grid */}
        <div className="audience-room__grid">
          {audience.map(fan => (
            <AudienceTile key={fan.id} fan={fan} />
          ))}
        </div>

        {/* Chat overlay */}
        <div className="audience-room__chat">
          {chat2.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="audience-room__controls">
        <div className="tip-control">
          <button className="tip-control__arrow" onClick={() => setTipAmt(a => Math.max(1, a-1))}>◀</button>
          <span className="tip-control__label">TIP</span>
          <span className="tip-control__amount">${tipAmt}</span>
          <button className="tip-control__arrow" onClick={() => setTipAmt(a => a+1)}>▶</button>
        </div>
        <div className="reaction-bar">
          {['👍','❤️','💜','🔥','🎵','💎'].map((r, i) => (
            <button key={i} className="reaction-bar__btn">{r}</button>
          ))}
          <button className="reaction-bar__btn reaction-bar__btn--next">▶</button>
        </div>
        <div className="audience-room__util-btns">
          <button className="audience-room__util-btn">🔍</button>
          <button className="audience-room__util-btn">🔄</button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="audience-room__footer">Video Grid</div>
    </div>
  );
}
