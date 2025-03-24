import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <main className="min-h-screen flex flex-col pb-16">
          <header className="bg-white border-b border-gray-200 px-4 py-4">
            <h1 className="text-xl font-bold text-blue-600">SnapWort</h1>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
