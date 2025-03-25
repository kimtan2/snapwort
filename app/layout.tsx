'use client';
import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { BottomNav } from '@/components/BottomNav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 
  
  const pathname = usePathname();
  
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <main className="min-h-screen flex flex-col pb-20">
          <header className="py-4 px-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex justify-between items-center ">
                <Link href="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  SnapWort
                </Link>
                
              </div>
              { pathname == '/library' && (
                  <Link
                    href="/backup"
                    className="flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <Cloud className={cn("h-5 w-5 mb-1")} />
                    <span className="text-xs font-medium">Backup</span>
                  </Link>
                )}
            </div>
          </header>
          <div className="flex-1">
            {children}
          </div>
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
