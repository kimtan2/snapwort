'use client';

import { Library } from '@/components/Library';
import { BottomNav } from '@/components/BottomNav';

export default function LibraryPage() {
  return (
    <>
      <div className="flex-1 overflow-auto">
        <Library />
      </div>
      <BottomNav />
    </>
  );
} 