'use client';

import React, { useState, useEffect } from 'react';
import HighFidelityAvatar from '@/components/avatar/HighFidelityAvatar';
import ImageUploader from '@/components/media/ImageUploader';
import { CheckCircle } from 'lucide-react';

interface ProfileAvatarManagerProps {
  initialAvatarUrl?: string;
  userName: string;
  tierColor?: string;
}

/**
 * Profile Avatar Manager
 * Creates the instant-feedback identity loop. Uploads photo, updates the 
 * High-Fidelity Avatar immediately, and broadcasts the change to the platform.
 */
export default function ProfileAvatarManager({ 
  initialAvatarUrl, 
  userName, 
  tierColor = '#00FFFF' 
}: ProfileAvatarManagerProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialAvatarUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUploadComplete = (finalCdnUrl: string) => {
    setAvatarUrl(finalCdnUrl);
    setSaveSuccess(true);
    
    // TODO: In production, trigger a TRPC/Next.js Server Action here to save `finalCdnUrl` to the DB.
    // Fire a custom event so the top-right nav bar catches the new avatar instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tmi:avatar-updated', { detail: { url: finalCdnUrl } }));
    }

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-[#050510] p-6 rounded-2xl border border-white/10 w-full max-w-2xl">
      
      {/* Left: The HD Identity Preview */}
      <div className="flex flex-col items-center gap-4">
        <HighFidelityAvatar imageUrl={avatarUrl} name={userName} size={140} tierColor={tierColor} />
        <div className="text-center">
          <h3 className="text-lg font-black text-white uppercase tracking-widest">{userName}</h3>
          <p className="text-[10px] text-white/50 tracking-[0.2em] uppercase">Identity Layer</p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#00FF88] uppercase tracking-widest bg-[#00FF88]/10 px-3 py-1.5 rounded-full border border-[#00FF88]/30">
            <CheckCircle size={12} /> Sync Complete
          </div>
        )}
      </div>

      {/* Right: The Upload Pipeline */}
      <div className="flex-1 w-full">
        <div className="mb-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Update Appearance</h4>
          <p className="text-[10px] text-white/40">Upload a real photo to replace generic avatars across the Memory Wall and Live Lobbies.</p>
        </div>
        <ImageUploader 
          context="profile" 
          onUploadComplete={handleUploadComplete} 
          accentColor={tierColor} 
        />
      </div>
    </div>
  );
}