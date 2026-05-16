'use client';

import { useEffect } from 'react';
import TmiHomebookAccountHud from './TmiHomebookAccountHud';
import TmiHomebookJumpNav from './TmiHomebookJumpNav';
import TmiHomebookSectionButtons from './TmiHomebookSectionButtons';

export default function TmiGlobalNav() {
  useEffect(() => {
    console.info('[TmiGlobalNav] mount');
  }, []);

  return (
    <header className="absolute top-3 inset-x-3 md:inset-x-6 z-[100] flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none">
      <TmiHomebookSectionButtons />
      <div className="flex flex-wrap items-center gap-3">
        <TmiHomebookJumpNav />
        <TmiHomebookAccountHud />
      </div>
    </header>
  );
}