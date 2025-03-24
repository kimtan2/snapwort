'use client';

import EnhancedWordSearch from '@/components/EnhancedWordSearch';
import { BottomNav } from '@/components/BottomNav';

export default function Home() {
  return (
    <>
      <div className="flex-1 flex items-center justify-center py-8">
        <EnhancedWordSearch />
      </div>
      <BottomNav />
    </>
  );
}