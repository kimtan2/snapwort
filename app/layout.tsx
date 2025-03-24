import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { BottomNav } from '@/components/BottomNav';

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'SnapWort - Word Dictionary',
  description: 'Look up and save word definitions in English and German',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <main className="min-h-screen flex flex-col pb-20">
          <header className="bg-white shadow-sm border-b border-blue-100 px-4 py-4 sticky top-0 z-10">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SnapWort
            </h1>
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
