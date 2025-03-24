'use client';

import { WordSearch } from '@/components/WordSearch';
import { BottomNav } from '@/components/BottomNav';

export default function Home() {
  return (
    <>
      <div className="flex-1 flex items-center justify-center">
        <WordSearch />
      </div>
      <BottomNav />
    </>
  );
}
