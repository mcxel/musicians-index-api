'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface AvatarUploadPipelineProps {
  userId: string;
  currentImage?: string | null;
  fallbackEmoji?: string;
  size?: number;
  accentColor?: string;
  onUploadSuccess?: (url: string) => void;
}

export default function AvatarUploadPipeline({
  userId: _userId, currentImage, fallbackEmoji = '👤', size = 88, accentColor = '#00FFFF', onUploadSuccess
}: AvatarUploadPipelineProps) {
  const [image, setImage] = useState(currentImage);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setImage(currentImage);
  }, [currentImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', 'profile');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      if (data.success) {
        const profileRes = await fetch('/api/profile/update', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ avatarUrl: data.url }),
        });

        if (!profileRes.ok) {
          throw new Error('Profile update failed');
        }

        const profileData = await profileRes.json() as { saved?: boolean };
        if (!profileData.saved) {
          throw new Error('Profile update did not persist');
        }

        setImage(data.url);
        if (onUploadSuccess) onUploadSuccess(data.url);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group" style={{ width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: image ? '#000' : `linear-gradient(135deg, ${accentColor}44, #111)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, border: `2px solid ${accentColor}`, boxShadow: `0 0 20px ${accentColor}40`, overflow: 'hidden', position: 'relative' }}>
        {image ? (
          <Image src={image} alt="Avatar" fill sizes={`${size}px`} className="object-cover" />
        ) : (
          <span>{fallbackEmoji}</span>
        )}
        {/* Upload Overlay */}
        <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
          <span className="text-white text-[10px] font-black uppercase tracking-widest text-center leading-tight">{isUploading ? 'Uploading...' : 'Change\nPhoto'}</span>
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
    </div>
  );
}