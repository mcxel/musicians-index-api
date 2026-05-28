'use client';

import React from 'react';
import Image from 'next/image';
import AdRailSlot from '@/components/ads/AdRailSlot';

interface ArticleProps {
  issueNumber: string;
  headline: string;
  imageAssetPath: string;
}

export default function MagazineEditorialSpread({ issueNumber, headline, imageAssetPath }: ArticleProps) {
  return (
    <div className="relative w-full h-[85vh] bg-[#050510] flex items-center justify-center overflow-hidden group">
      
      {/* Broken Grid / Angled Clip-Path Background */}
      <div 
        className="absolute inset-0 z-0 transition-transform duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}
      >
        <Image 
          src={imageAssetPath}
          alt={`Issue ${issueNumber}`}
          fill
          className="object-cover opacity-60 mix-blend-luminosity grayscale group-hover:grayscale-0 transition-all duration-700"
          priority
        />
        {/* Intense Vignette to preserve text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-[#050510]/50" />
      </div>

      {/* Editorial Text Over Media */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col justify-end pb-12">
          <div className="flex items-center space-x-4 mb-6">
            <span className="w-12 h-1 bg-indigo-500"></span>
            <span className="font-mono text-sm tracking-[0.3em] text-indigo-400 font-bold uppercase">Issue {issueNumber}</span>
          </div>
          
          <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.85] uppercase tracking-tighter mix-blend-difference">
            {headline}
          </h2>
          
          <button className="mt-10 self-start px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-indigo-500 hover:text-white transition-colors duration-300 rounded-none clip-path-slant">Read the Feature</button>

          <div className="mt-6 max-w-sm">
            <AdRailSlot
              slotId="magazine-article-rail"
              hasSponsor={false}
              hasAdvertiser={false}
              title="Article Rail"
            />
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 self-end pb-12">
          <AdRailSlot
            slotId="magazine-footer-block"
            hasSponsor={false}
            hasAdvertiser={false}
            title="Magazine Footer Block"
          />
        </div>
      </div>
    </div>
  );
}