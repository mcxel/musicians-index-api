// TMI — 3D Theater Audience Engine (React Component)
// BerntoutGlobal · The Musician's Index
// Drop into apps/web and import AudienceScene

import { useEffect, useRef, useState, useCallback } from 'react';

const VENUES = [
  { name:'Theater', wallColor:'#1a0a04', floorColor:'#0e0602', ceilColor:'#0a0400', wallTex:true, crowd:2730 },
  { name:'Arena',   wallColor:'#0a0a12', floorColor:'#080810', ceilColor:'#050510', wallTex:false, crowd:18500 },
  { name:'Club',    wallColor:'#0a0018', floorColor:'#060010', ceilColor:'#04000e', wallTex:false, crowd:420 },
  { name:'Outdoor', wallColor:'#050c18', floorColor:'#030a10', ceilColor:'#000608', wallTex:false, crowd:8200 },
  { name:'Boardroom',wallColor:'#080814',floorColor:'#050510', ceilColor:'#030308', wallTex:true, crowd:120 },
];

const SKINS = ['#8B4513','#5C3317','#2F1B0E','#A0522D','#CD853F','#D2691E','#704214','#3D2008'];
const HAIR  = ['#1a0a00','#3d2000','#000000','#2a1500','#0a0a0a','#4a2800'];

function lerp(a, b, t) { return a + (b - a) * t; }

function drawHead(ctx, x, y, sz, skin, hair, aph, forward, lit) {
  const L = lit;
  const ch = (hex, idx) => Math.round(parseInt(hex.slice(1 + idx * 2, 3 + idx * 2), 16) * L);
  const skinRgb = `rgb(${ch(skin,0)},${ch(skin,1)},${ch(skin,2)})`;
  const hairRgb = `rgb(${ch(hair,0)},${ch(hair,1)},${ch(hair,2)})`;

  ctx.save();

  if (!forward) {
    // Back-of-head (fan view)
    ctx.strokeStyle = `rgba(${ch(skin,0)},${ch(skin,1)},${ch(skin,2)},.75)`;
    ctx.lineWidth = sz * .32;
    ctx.lineCap = 'round';
    if (Math.random() < .10) {
      ctx.beginPath();
      ctx.moveTo(x - sz * .3, y + sz * .6);
      ctx.lineTo(x - sz * .3 + Math.sin(aph) * sz * 1.2, y - sz * 1.1);
      ctx.stroke();
    } else {
      ctx.beginPath();ctx.moveTo(x - sz*.4, y + sz*.7);ctx.lineTo(x - sz*.4 + Math.sin(aph)*sz*.6, y+sz+Math.cos(aph)*sz*.3);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x + sz*.4, y + sz*.7);ctx.lineTo(x + sz*.4 + Math.sin(aph+1)*sz*.5, y+sz+Math.cos(aph+1)*sz*.3);ctx.stroke();
    }
    ctx.fillStyle = skinRgb;
    ctx.beginPath();ctx.ellipse(x, y+sz*.8, sz*.72, sz*.9, 0, 0, Math.PI*2);ctx.fill();
    ctx.fillStyle = hairRgb;
    ctx.beginPath();ctx.ellipse(x, y, sz*.78, sz*.8, 0, 0, Math.PI*2);ctx.fill();

  } else {
    // Front-facing (performer view)
    ctx.fillStyle = skinRgb;
    ctx.beginPath();ctx.ellipse(x, y+sz*.5, sz*.56, sz*.65, 0, 0, Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x, y, sz*.66, sz*.72, 0, 0, Math.PI*2);ctx.fill();
    ctx.fillStyle = hairRgb;
    ctx.beginPath();ctx.arc(x, y - sz*.1, sz*.7, Math.PI, 0);ctx.fill();
    // ears
    ctx.fillStyle = skinRgb;
    ctx.beginPath();ctx.ellipse(x - sz*.74, y + sz*.1, sz*.22, sz*.18, 0, 0, Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x + sz*.74, y + sz*.1, sz*.22, sz*.18, 0, 0, Math.PI*2);ctx.fill();
    // eyes
    ctx.fillStyle = `rgba(30,10,0,${.8 * L})`;
    ctx.beginPath();ctx.ellipse(x-sz*.22, y, sz*.12, sz*.16, 0, 0, Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x+sz*.22, y, sz*.12, sz*.16, 0, 0, Math.PI*2);ctx.fill();
    // mouth
    ctx.strokeStyle = `rgba(50,18,0,${.65*L})`;ctx.lineWidth=sz*.12;ctx.lineCap='round';
    ctx.beginPath();ctx.arc(x, y+sz*.22, sz*.22, 0, Math.PI);ctx.stroke();
    // arms
    ctx.strokeStyle = `rgba(${ch(skin,0)*.8},${ch(skin,1)*.8},${ch(skin,2)*.8},.75)`;
    ctx.lineWidth=sz*.32;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x-sz*.5,y+sz*.5);ctx.lineTo(x-sz*.6+Math.sin(aph)*sz*.9,y+sz*.4+Math.cos(aph)*sz*.6);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+sz*.5,y+sz*.5);ctx.lineTo(x+sz*.6+Math.sin(aph+1.2)*sz*.8,y+sz*.4+Math.cos(aph+1.2)*sz*.5);ctx.stroke();
  }
  ctx.restore();
}

function drawBricks(ctx, x, y, w, h, col) {
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,.35)';
  ctx.lineWidth = .8;
  const bw = 44, bh = 16;
  for (let r = 0; r * bh < h; r++) {
    const off = (r % 2) * bw / 2;
    for (let c = 0; c * bw < w + bw; c++) ctx.strokeRect(x + c*bw - off, y + r*bh, bw, bh);
  }
}

export function AudienceScene({ view = 'fan', venue = 0, onReaction }) {
  const canvasRef = useRef(null);
  const timeRef   = useRef(0);
  const frameRef  = useRef(null);
  const stateRef  = useRef({ wave: false, jump: false, hype: false });

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const v = VENUES[venue] || VENUES[0];
    const t = timeRef.current++;
    const s = stateRef.current;

    ctx.clearRect(0, 0, W, H);

    if (view === 'fan') {
      // Brick wall
      if (v.wallTex) drawBricks(ctx, 0, 0, W, H*.52, v.wallColor);
      else { ctx.fillStyle = v.wallColor; ctx.fillRect(0, 0, W, H*.52); }
      ctx.fillStyle = v.floorColor; ctx.fillRect(0, H*.52, W, H*.48);

      // Screen
      const scrX=180, scrY=30, scrW=440, scrH=210;
      ctx.fillStyle='#1a0900'; ctx.fillRect(scrX-10, scrY-10, scrW+20, scrH+20);
      const ag = ctx.createRadialGradient(scrX+scrW/2, scrY+scrH/2, 10, scrX+scrW/2, scrY+scrH/2, scrW*.75);
      const ga = .84 + Math.sin(t*.02)*.13;
      ag.addColorStop(0, `rgba(255,160,40,${ga})`);
      ag.addColorStop(.4, `rgba(200,100,15,${ga*.82})`);
      ag.addColorStop(1, 'rgba(40,15,0,0)');
      ctx.fillStyle = ag; ctx.fillRect(scrX, scrY, scrW, scrH);

      // Wall glow from screen
      const wg = ctx.createRadialGradient(scrX+scrW/2, scrY+scrH, 0, scrX+scrW/2, scrY+scrH, scrW*.9);
      wg.addColorStop(0, `rgba(255,140,20,${.16*ga})`); wg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = wg; ctx.fillRect(0, scrY, W, scrH+90);

      // Audience rows (back-of-head)
      [
        { y:310, seats:15, sw:48, sz:9.5, lit:.15 },
        { y:332, seats:14, sw:52, sz:11,  lit:.22 },
        { y:355, seats:13, sw:57, sz:13,  lit:.32 },
        { y:376, seats:12, sw:62, sz:14.5,lit:.44 },
        { y:397, seats:11, sw:68, sz:16,  lit:.58 },
        { y:418, seats:10, sw:74, sz:17.5,lit:.72 },
        { y:440, seats:9,  sw:80, sz:18.5,lit:.85 },
      ].forEach((row, ri) => {
        const sx = (W - row.seats * row.sw) / 2;
        for (let c = 0; c < row.seats; c++) {
          const idx = ri*20+c;
          const px = sx + c*row.sw + row.sw/2;
          const wb = s.wave ? Math.sin(t*.04+c*.6+ri*.3)*4.5 : 0;
          const jb = s.jump ? Math.abs(Math.sin(t*.08)) * -7 : 0;
          drawHead(ctx, px, row.y+wb+jb, row.sz, SKINS[(idx*7+c*3)%SKINS.length], HAIR[(idx*5+ri*2)%HAIR.length], t*.025+(c*.4)+(ri*.2), false, row.lit);
        }
      });

    } else {
      // PERFORMER VIEW
      const bg = ctx.createLinearGradient(0,0,0,H);
      bg.addColorStop(0, v.ceilColor); bg.addColorStop(1, v.floorColor);
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

      if (v.wallTex) drawBricks(ctx, 0, 0, W, H*.42, v.wallColor);
      else { ctx.fillStyle=v.wallColor; ctx.fillRect(0,0,W,H*.42); }

      // Stage warm glow
      const sg = ctx.createRadialGradient(W/2,H,0,W/2,H,W*.65);
      sg.addColorStop(0,'rgba(255,100,0,.32)'); sg.addColorStop(.5,'rgba(180,60,0,.1)'); sg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=sg; ctx.fillRect(0,H*.48,W,H*.52);

      // Audience rows (front-facing)
      [
        { ri:0, yB:H*.40, seats:20, sw:36, sz:8,   lit:.65 },
        { ri:1, yB:H*.46, seats:18, sw:40, sz:9.5, lit:.72 },
        { ri:2, yB:H*.52, seats:16, sw:44, sz:11,  lit:.78 },
        { ri:3, yB:H*.58, seats:14, sw:50, sz:13,  lit:.84 },
        { ri:4, yB:H*.65, seats:12, sw:56, sz:14.5,lit:.90 },
        { ri:5, yB:H*.72, seats:10, sw:62, sz:16,  lit:.94 },
        { ri:6, yB:H*.79, seats:8,  sw:70, sz:17.5,lit:.97 },
        { ri:7, yB:H*.86, seats:6,  sw:80, sz:19,  lit:1   },
      ].forEach(row => {
        const sx = (W - row.seats*row.sw) / 2;
        for (let c = 0; c < row.seats; c++) {
          const idx = row.ri*30+c;
          const px = sx + c*row.sw + row.sw/2;
          const wb = s.wave ? Math.sin(t*.04+c*.5)*5.5 : 0;
          const jb = s.jump ? Math.abs(Math.sin(t*.08+c*.3))*-9 : 0;
          const hb = s.hype ? (Math.sin(t*.06+c*.4)*4.5+Math.sin(t*.03+c*.2)*3.5) : 0;
          drawHead(ctx, px, row.yB+wb+jb+hb, row.sz, SKINS[(idx*7+c*3)%SKINS.length], HAIR[(idx*5+row.ri*2)%HAIR.length], t*.028+(c*.35)+(row.ri*.15), true, row.lit);
        }
      });

      const tf = ctx.createLinearGradient(0,H*.86,0,H);
      tf.addColorStop(0,'rgba(0,0,0,0)'); tf.addColorStop(1,v.floorColor);
      ctx.fillStyle=tf; ctx.fillRect(0,H*.86,W,H*.14);
    }

    frameRef.current = requestAnimationFrame(render);
  }, [view, venue]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameRef.current);
  }, [render]);

  const triggerWave = () => { stateRef.current.wave = true; setTimeout(() => stateRef.current.wave=false, 3200); };
  const triggerJump = () => { stateRef.current.jump = true; setTimeout(() => stateRef.current.jump=false, 2400); };
  const triggerHype = () => { stateRef.current.hype = true; setTimeout(() => stateRef.current.hype=false, 4000); };

  return (
    <div style={{ position:'relative' }}>
      <canvas
        ref={canvasRef}
        width={900}
        height={480}
        style={{ display:'block', width:'100%', borderRadius:8 }}
      />
      {/* Expose crowd actions via ref or props as needed */}
      <div style={{ position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', display:'flex', gap:6 }}>
        <button onClick={triggerWave} style={{ background:'transparent', border:'1px solid rgba(220,70,0,.7)', color:'#FF8C00', borderRadius:4, padding:'4px 10px', fontSize:11, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>🌊 WAVE</button>
        <button onClick={triggerJump} style={{ background:'transparent', border:'1px solid rgba(220,70,0,.7)', color:'#FF8C00', borderRadius:4, padding:'4px 10px', fontSize:11, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>⬆ JUMP</button>
        <button onClick={triggerHype} style={{ background:'transparent', border:'1px solid #FFD700', color:'#FFD700', borderRadius:4, padding:'4px 10px', fontSize:11, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>🔥 HYPE</button>
      </div>
    </div>
  );
}

// Usage:
// <AudienceScene view="fan" venue={0} />
// <AudienceScene view="performer" venue={1} />
// Props:
//   view     — 'fan' | 'performer'
//   venue    — 0=Theater 1=Arena 2=Club 3=Outdoor 4=Boardroom
//   onReaction — optional callback (emoji: string) => void
export default AudienceScene;
