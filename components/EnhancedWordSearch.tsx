import React, { useState } from 'react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Search, Book, ArrowRight, Bookmark, LoaderCircle, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { speakText } from '@/lib/textToSpeech';

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
      
      setMeaning(data.definition);
      
      // Save to library
      await db.words.add({
        word: data.word,
        meaning: data.definition,
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
    <div className="w-full max-w-2xl flex flex-col items-center">
      {!meaning && !error && (
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-6">
            <span className="text-blue-600">Snap</span>
            <span className="text-indigo-600">Wort</span>
          </h1>
        </div>
      )}
      
      <div className={cn(
        "w-full transition-all",
        meaning ? "max-w-2xl" : "max-w-xl"
      )}>
        <div className={cn(
          "flex items-center space-x-2 mb-4",
          meaning ? "justify-start" : "justify-center"
        )}>
          <div
            onClick={() => setLanguage('en')}
            className={cn(
              "flex items-center justify-center px-4 py-2 rounded-full cursor-pointer transition-all",
              language === 'en' 
                ? "bg-blue-100 text-blue-700 font-medium" 
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            )}
          >
            <span>English</span>
          </div>
          
          <div
            onClick={() => setLanguage('de')}
            className={cn(
              "flex items-center justify-center px-4 py-2 rounded-full cursor-pointer transition-all",
              language === 'de' 
                ? "bg-blue-100 text-blue-700 font-medium" 
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            )}
          >
            <span>German</span>
          </div>
        </div>

        <div className={cn(
          "relative group transition-all",
          meaning ? "" : "mx-auto"
        )}>
          <div className="flex items-center">
            <div className={cn(
              "relative w-full",
              meaning ? "rounded-lg shadow-sm" : "rounded-full shadow-lg"
            )}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Search a ${language === 'en' ? 'English' : 'German'} word...`}
                className={cn(
                  "w-full pl-12 pr-12 py-4 text-lg transition-all focus:outline-none",
                  meaning 
                    ? "border border-gray-200 focus:border-blue-500 rounded-lg" 
                    : "border-0 focus:shadow-md rounded-full shadow-md hover:shadow-lg"
                )}
              />
              {word.trim() && (
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 transition-all",
                    loading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-50"
                  )}
                >
                  {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {!meaning && !error && !loading && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Look up and save word definitions instantly</p>
          </div>
        )}

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
              <div className="flex items-center space-x-3">
                <h3 className="font-bold text-xl text-gray-900">{word}</h3>
                <button
                  onClick={() => speakText(word, language)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              {saved && (
                <div className="flex items-center text-green-600 text-sm">
                  <Bookmark className="h-4 w-4 mr-1" />
                  Saved to library
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown>{meaning}</ReactMarkdown>
              </div>
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
      </div>
    </div>
  );
}