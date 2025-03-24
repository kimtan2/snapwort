import React, { useState } from 'react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Search, Book, ArrowRight, Bookmark, LoaderCircle } from 'lucide-react';

type Language = 'en' | 'de';

export default function EnhancedWordSearch() {
  const [word, setWord] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [meaning, setMeaning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSearch = async () => {
    if (!word.trim()) return;
    
    setLoading(true);
    setError(null);
    setSaved(false);
    
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
      
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get word meaning');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">SnapWort</h1>
        <p className="text-gray-600">Look up and save word definitions instantly</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-2 mb-6">
          <div
            onClick={() => setLanguage('en')}
            className={cn(
              "flex-1 flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all",
              language === 'en' 
                ? "bg-blue-100 border-2 border-blue-500" 
                : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
            )}
          >
            <span className={cn(
              "font-medium",
              language === 'en' ? "text-blue-700" : "text-gray-700"
            )}>English</span>
          </div>
          
          <div
            onClick={() => setLanguage('de')}
            className={cn(
              "flex-1 flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all",
              language === 'de' 
                ? "bg-blue-100 border-2 border-blue-500" 
                : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
            )}
          >
            <span className={cn(
              "font-medium",
              language === 'de' ? "text-blue-700" : "text-gray-700"
            )}>German</span>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Enter a ${language === 'en' ? 'English' : 'German'} word...`}
            className="w-full rounded-lg border border-gray-300 pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !word.trim()}
            className={cn(
              "absolute right-2 top-2 rounded-lg p-1 transition-colors",
              loading || !word.trim()
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-100"
            )}
          >
            {loading ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            <p className="flex items-center">
              <span className="inline-block w-1 h-4 bg-red-500 rounded mr-2"></span>
              {error}
            </p>
          </div>
        )}

        {meaning && !error && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">{word}</h3>
              {saved && (
                <div className="flex items-center text-green-600 text-sm">
                  <Bookmark className="h-4 w-4 mr-1" />
                  Saved to library
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-gray-700 leading-relaxed">{meaning}</p>
            </div>
            
            <div className="pt-4 text-center">
              <a href="/library" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm">
                <Book className="h-4 w-4 mr-1" />
                View your word library
                <ArrowRight className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        )}

        {!meaning && !error && (
          <div className="mt-8 text-center py-6">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-blue-50 flex items-center justify-center">
              <Search className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-gray-700 font-medium">Enter a word to get started</h3>
            <p className="text-gray-500 text-sm mt-2">
              All searched words are automatically saved to your library
            </p>
          </div>
        )}
      </div>
    </div>
  );
}