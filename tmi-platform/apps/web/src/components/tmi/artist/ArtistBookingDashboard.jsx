/**
 * TMI — ARTIST BOOKING DASHBOARD
 * Matches PDF pages 4 & 5: Map-based booking, city markers,
 * payment cards, hotel/ride, gig list, P&L simulator
 */
'use client';

import React, { useState } from 'react';
import './ArtistBookingDashboard.css';

const GIGS = [
  { id:1, venue:'Club Groove', city:'Atlanta', pay:'$300-500', rank:1 },
  { id:2, venue:'Riff Room', city:'New Orleans', pay:'$250-500', rank:2 },
  { id:3, venue:'Soul Cabaret', city:'Memphis', pay:'$525', rank:3 },
  { id:4, venue:'Blast Beats', city:'Seattle', pay:'$500-900', rank:4 },
];

const MAP_PINS = [
  { label:'Skyline Stage',  x:67, y:25, city:'Chicago' },
  { label:'Basement Club',  x:28, y:22, city:'Denver' },
  { label:'Retro Dome',     x:22, y:42, city:'Phoenix' },
  { label:'Neon Lounge',    x:58, y:52, city:'Atlanta' },
  { label:'Blue Note 8ar',  x:38, y:60, city:'Houston' },
];

const CITIES_GLOW = [
  { id:'memphis',   x:63, y:42, label:'MEMPHIS',    active:true },
  { id:'stockton',  x:15, y:45, label:'STOCKTON',   active:false },
  { id:'saccaluwa', x:22, y:55, label:'SACCALUWA',  active:false },
];

function USABookingMap({ pins, cities }) {
  const [hover, setHover] = useState(null);
  return (
    <div className="booking-map">
      <div className="booking-map__label">BOOKING MAP</div>
      <svg viewBox="0 0 100 70" className="booking-map__svg">
        {/* USA outline simplified */}
        <path className="booking-map__land"
          d="M8,15 L85,10 L92,18 L90,42 L85,50 L72,52 L62,58 L45,60 L28,58 L12,50 L6,36 Z" />
        {/* Heat dots */}
        {Array.from({length:40},(_,i) => (
          <circle key={i}
            cx={10+Math.random()*80} cy={15+Math.random()*45}
            r={1.5} fill="rgba(255,20,147,0.25)"
          />
        ))}
        {/* Interactive pins */}
        {pins.map(p => (
          <g key={p.label} transform={`translate(${p.x},${p.y})`}
            onMouseEnter={() => setHover(p)} onMouseLeave={() => setHover(null)}
            style={{ cursor:'pointer' }}>
            <circle r="3" fill="var(--neon-pink)"
              style={{ filter:'drop-shadow(0 0 4px #FF1493)' }}
            />
            {hover?.label === p.label && (
              <foreignObject x="-30" y="-22" width="60" height="18">
                <div className="booking-map__pin-label">{p.label}</div>
              </foreignObject>
            )}
          </g>
        ))}
      </svg>
      {/* Bottom bar */}
      <div className="booking-map__footer">
        <span>Queue Rank <strong>24</strong></span>
        <span>Budget <strong className="neon-cyan">$360</strong></span>
        <span>Tier <strong>Free</strong></span>
      </div>
    </div>
  );
}

function GigList({ gigs }) {
  return (
    <div className="gig-list">
      <div className="gig-list__title">AVAILABLE BOOKINGS</div>
      {gigs.map(g => (
        <div key={g.id} className="gig-list__item">
          <span className="gig-list__rank">{g.rank}</span>
          <div className="gig-list__info">
            <div className="gig-list__venue">{g.venue}</div>
            <div className="gig-list__city">{g.city}</div>
          </div>
          <div className="gig-list__pay">{g.pay}</div>
        </div>
      ))}
    </div>
  );
}

function PaydayPanel() {
  return (
    <div className="payday-panel">
      <div className="payday-panel__row">
        <div className="payday-panel__label">NEXT SHOW PAYDAY<br/><span className="payday-panel__sub">LAST MEMPHIS SHOW EARNED</span></div>
        <div className="payday-panel__value">$780</div>
      </div>
      <div className="payday-panel__row">
        <div className="payday-panel__label">NEXT SHOW PAYDAY<br/><span style={{fontSize:11}}>⏱</span></div>
        <div className="payday-panel__value payday-panel__value--pending">$320</div>
      </div>
      <div className="payday-panel__offer">
        <div className="payday-panel__offer-label">WOULD YOU LIKE TO PERFORM?</div>
        <div className="payday-panel__offer-detail">@ @WoodyWill on Jan 7</div>
      </div>
    </div>
  );
}

export default function ArtistBookingDashboard() {
  return (
    <div className="booking-dashboard">
      <h1 className="booking-dashboard__title">
        <span className="booking-dashboard__title-artist">ARTIST</span>
        <span className="booking-dashboard__title-booking">BOOKING</span>
        <span className="booking-dashboard__title-dash">DASHBOARD</span>
      </h1>
      <div className="booking-dashboard__divider" />

      <div className="booking-dashboard__grid">
        <GigList gigs={GIGS} />
        <USABookingMap pins={MAP_PINS} cities={CITIES_GLOW} />
        <PaydayPanel />
      </div>

      {/* Bottom utility row */}
      <div className="booking-dashboard__bottom-bar">
        <button className="booking-dashboard__util-btn">🏨 NEED A HOTEL STAY?</button>
        <div className="booking-dashboard__util-value">$320€</div>
        <button className="booking-dashboard__util-btn">🚗 HAVE A RIDE?</button>
      </div>
    </div>
  );
}
