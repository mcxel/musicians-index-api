'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const roleParam = searchParams?.get('role') ?? 'fan';
  const [role, setRole] = useState(roleParam);
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Set session and account memory for routing
    document.cookie = `tmi_role=${role}; path=/`;
    document.cookie = `tmi_session=true; path=/`;
    document.cookie = `tmi_session_id=123; path=/`;
    document.cookie = `tmi_last_workspace=/dashboard/${role}; path=/`;
    router.push(`/dashboard/${role}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 800, width: '100%', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', padding: 32 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => setRole('fan')} style={{ padding: '8px 16px', background: role === 'fan' ? '#FF6B00' : 'transparent', color: role === 'fan' ? '#000' : '#aaa', border: '1px solid #FF6B00', borderRadius: 8, cursor: 'pointer', fontWeight: 800 }}>
            Fan Sign Up
          </button>
          <button onClick={() => setRole('artist')} style={{ padding: '8px 16px', background: role === 'artist' ? '#FF2DAA' : 'transparent', color: role === 'artist' ? '#fff' : '#aaa', border: '1px solid #FF2DAA', borderRadius: 8, cursor: 'pointer', fontWeight: 800 }}>
            Artist Sign Up
          </button>
          <button onClick={() => setRole('sponsor')} style={{ padding: '8px 16px', background: role === 'sponsor' ? '#00FFFF' : 'transparent', color: role === 'sponsor' ? '#000' : '#aaa', border: '1px solid #00FFFF', borderRadius: 8, cursor: 'pointer', fontWeight: 800 }}>
            Sponsor Sign Up
          </button>
          <button onClick={() => setRole('advertiser')} style={{ padding: '8px 16px', background: role === 'advertiser' ? '#00FF88' : 'transparent', color: role === 'advertiser' ? '#000' : '#aaa', border: '1px solid #00FF88', borderRadius: 8, cursor: 'pointer', fontWeight: 800 }}>
            Advertiser Sign Up
          </button>
        </div>

        {role === 'fan' && (
          <form onSubmit={handleSignup} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            <div>
              <h2 style={{ color: '#FF6B00', fontSize: 24, margin: '0 0 16px' }}>Join the crowd, experience the show!</h2>
              <div style={{ background: 'rgba(255,107,0,0.1)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,107,0,0.3)', marginBottom: 20 }}>
                <div style={{ fontWeight: 800, marginBottom: 8, color: '#FF6B00' }}>Choose Subscription</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['FREE', 'RUBY', 'SILVER', 'GOLD', 'DIAMOND'].map(tier => (
                    <div key={tier} style={{ flex: 1, minWidth: 40, padding: 8, textAlign: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', fontSize: 10, fontWeight: 700 }}>
                      {tier === 'RUBY' ? 'RUBY' : tier}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="text" placeholder="Username" required style={{ padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <input type="email" placeholder="Email" required style={{ padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <input type="password" placeholder="Password" required style={{ padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <select style={{ padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}>
                <option value="fan">Fan</option>
                <option value="super-fan">Super Fan</option>
                <option value="host">Host Fan</option>
              </select>
              <button type="submit" style={{ padding: 14, background: '#FF6B00', color: '#000', border: 'none', borderRadius: 8, fontWeight: 900, cursor: 'pointer', marginTop: 8 }}>
                JOIN THE CROWD
              </button>
            </div>
          </form>
        )}

        {role !== 'fan' && (
          <form onSubmit={handleSignup} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            <div>
              <h2 style={{ color: role === 'artist' ? '#FF2DAA' : role === 'sponsor' ? '#00FFFF' : '#00FF88', fontSize: 24, margin: '0 0 16px', textTransform: 'capitalize' }}>{role} Sign Up</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Create your {role} account to access the platform&apos;s tools, analytics, and marketplace.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="text" placeholder={role === 'sponsor' || role === 'advertiser' ? 'Company Name' : 'Username'} required style={{ padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <input type="email" placeholder="Email" required style={{ padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <input type="password" placeholder="Password" required style={{ padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <button type="submit" style={{ padding: 14, background: role === 'artist' ? '#FF2DAA' : role === 'sponsor' ? '#00FFFF' : '#00FF88', color: '#000', border: 'none', borderRadius: 8, fontWeight: 900, cursor: 'pointer', marginTop: 8 }}>
                COMPLETE SIGNUP
              </button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Already have an account? <Link href="/auth" style={{ color: '#00FFFF' }}>Login here</Link></p>
        </div>
      </div>
    </div>
  );
}