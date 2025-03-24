'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Search, Loader2 } from 'lucide-react';

type Language = 'en' | 'de';

export function WordSearch() {
  const [word, setWord] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [meaning, setMeaning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!word.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/meaning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.trim(), language }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setMeaning(data.meaning);
      
      // Save to library
      await db.words.add({
        word: word.trim(),
        meaning: data.meaning,
        language,
        createdAt: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get word meaning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-card p-6 transition-all">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Word Lookup</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <div className="bg-primary-50 inline-flex rounded-lg p-1 w-full">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
                  language === 'en'
                    ? "bg-white text-primary-700 shadow-soft"
                    : "text-gray-600 hover:text-primary-600"
                )}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('de')}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
                  language === 'de'
                    ? "bg-white text-primary-700 shadow-soft"
                    : "text-gray-600 hover:text-primary-600"
                )}
              >
                German
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="word" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Word
            </label>
            <div className="relative">
              <input
                id="word"
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Enter a ${language === 'en' ? 'English' : 'German'} word...`}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <button
              onClick={handleSearch}
              disabled={loading || !word.trim()}
              className={cn(
                'mt-3 w-full rounded-lg px-6 py-3 font-medium text-white transition-all',
                loading || !word.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-md hover:translate-y-[-1px]'
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-4 duration-300">
              {error}
            </div>
          )}

          {meaning && !error && (
            <div className="rounded-lg bg-primary-50 p-5 space-y-2 border border-primary-100 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center">
                <div className="bg-primary-100 p-1.5 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 ml-2">Definition</h3>
              </div>
              <p className="text-gray-700 pl-8">{meaning}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}