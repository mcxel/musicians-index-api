'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageUploaderProps {
  context: 'profile' | 'memory_wall' | 'article';
  onUploadComplete: (url: string) => void;
  accentColor?: string;
}

export default function ImageUploader({ context, onUploadComplete, accentColor = '#00FFFF' }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG).');
      return;
    }
    
    setIsUploading(true);
    setError(null);

    // Optimistic UI: Instant visual proof before the network finishes
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      // Pass the final CDN URL back to the parent
      onUploadComplete(data.url);
    } catch (err: any) {
      setError(err.message);
      setPreviewUrl(null); // Revert preview on failure
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreview); // Free up browser memory
    }
  };

  return (
    <div className="w-full max-w-md">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${
          isDragging ? 'bg-white/10' : 'bg-[#050510] hover:bg-white/5'
        }`}
        style={{ borderColor: isDragging ? accentColor : 'rgba(255,255,255,0.2)' }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
        />
        
        {isUploading || previewUrl ? (
          <div className="relative w-full h-40 rounded-lg overflow-hidden flex items-center justify-center bg-black">
            {previewUrl && <img src={previewUrl} alt="Upload Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-110" />}
            {isUploading && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="relative z-10 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                <Loader2 size={40} color={accentColor} />
              </motion.div>
            )}
          </div>
        ) : (
          <>
            <UploadCloud size={40} className="mb-4 text-white/40" />
            <p className="text-sm font-bold tracking-widest text-white uppercase text-center mb-1">Drag & Drop Image</p>
            <p className="text-xs text-white/50 text-center">or click to browse your files (Max 10MB)</p>
          </>
        )}
      </div>
      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs font-bold tracking-wider text-[#FF2020] uppercase bg-[#FF2020]/10 p-2 rounded border border-[#FF2020]/30">
          <AlertCircle size={14} /> {error}
        </div>
      )}
    </div>
  );
}