'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';

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
    <div className="px-4 py-8 max-w-md mx-auto">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <label htmlFor="language" className="text-sm font-medium text-gray-700">
            Select Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="de">German</option>
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="word" className="text-sm font-medium text-gray-700">
            Enter Word
          </label>
          <div className="flex space-x-2">
            <input
              id="word"
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder={`Enter a ${language === 'en' ? 'English' : 'German'} word...`}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !word.trim()}
              className={cn(
                'rounded-lg px-6 py-2 font-medium text-white transition-colors',
                loading || !word.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {meaning && !error && (
          <div className="rounded-lg bg-gray-50 p-4 space-y-2">
            <h3 className="font-medium text-gray-900">Definition:</h3>
            <p className="text-gray-700">{meaning}</p>
          </div>
        )}
      </div>
    </div>
  );
}