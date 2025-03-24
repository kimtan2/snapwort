import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around h-16">
        <Link
          href="/"
          className={cn(
            'flex flex-col items-center justify-center w-full h-full text-sm',
            pathname === '/' ? 'text-blue-600' : 'text-gray-600'
          )}
        >
          <Search className="h-6 w-6" />
          <span className="mt-1">Search</span>
        </Link>
        
        <Link
          href="/library"
          className={cn(
            'flex flex-col items-center justify-center w-full h-full text-sm',
            pathname === '/library' ? 'text-blue-600' : 'text-gray-600'
          )}
        >
          <Book className="h-6 w-6" />
          <span className="mt-1">Library</span>
        </Link>
      </div>
    </nav>
  );
} 