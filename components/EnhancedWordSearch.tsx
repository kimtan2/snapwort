import React, { useState } from 'react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Search, Book, ArrowRight, Bookmark, LoaderCircle, Volume2, Send, ServerIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { speakText } from '@/lib/textToSpeech';

type Language = 'en' | 'de';
type Model = 'openai' | 'groq' | 'mistral';

interface LanguageResult {
  title: string;
  answer: string;
  suggestions: string[];
  modelUsed?: string;
}

interface FollowUpMessage {
  question: string;
  answer: string;
  modelUsed?: string;
}

export default function EnhancedWordSearch() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [model, setModel] = useState<Model>('groq');
  const [result, setResult] = useState<LanguageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [followUpMessages, setFollowUpMessages] = useState<FollowUpMessage[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [wordId, setWordId] = useState<number | undefined>(undefined);
  const [showModelSelector, setShowModelSelector] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setSaved(false);
    setResult(null);
    setFollowUpMessages([]);
    setWordId(undefined);
    
    try {
      // Call the API endpoint
      const response = await fetch('/api/meaning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          word: query.trim(), 
          language,
          model
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      console.log(data)
      
      setResult(data);
      
      // Save to library
      const id = await db.words.add({
        word: data.title,
        meaning: data.answer,
        language,
        createdAt: new Date(),
        followUpHistory: []
      });
      
      setWordId(id);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process your request');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFollowUpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFollowUpSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFollowUpQuestion(suggestion);
    setTimeout(() => handleFollowUpSubmit(), 100);
  };

  const handleFollowUpSubmit = async () => {
    if (!followUpQuestion.trim() || !result) return;
    
    setFollowUpLoading(true);
    
    try {
      // Create previous context
      const previousContext: { question: string; answer: string }[] = [];
      
      // Add initial query and result
      previousContext.push({
        question: query,
        answer: result.answer
      });
      
      // Add any existing follow-up conversations
      followUpMessages.forEach(message => {
        previousContext.push(message);
      });
      
      const response = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: followUpQuestion,
          language,
          previousContext,
          model
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      // Create new follow-up message
      const newFollowUp = { 
        question: followUpQuestion, 
        answer: data.answer,
        modelUsed: data.modelUsed
      };
      
      // Add the new follow-up message and answer to the conversation
      setFollowUpMessages(prev => [...prev, newFollowUp]);
      
      // Update in library if we have a word ID
      if (wordId !== undefined) {
        const word = await db.words.get(wordId);
        if (word) {
          const updatedFollowUpHistory = [...(word.followUpHistory || []), newFollowUp];
          await db.words.update(wordId, {
            followUpHistory: updatedFollowUpHistory
          });
        }
      }
      
      // Clear the input
      setFollowUpQuestion('');
    } catch (err) {
      console.error('Error with follow-up:', err);
    } finally {
      setFollowUpLoading(false);
    }
  };

  const toggleModelSelector = () => {
    setShowModelSelector(!showModelSelector);
  };

  const selectModel = (newModel: Model) => {
    setModel(newModel);
    setShowModelSelector(false);
  };

  const hasResult = result || error;

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      {!hasResult && (
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-6">
            <span className="text-blue-600">Snap</span>
            <span className="text-indigo-600">Wort</span>
          </h1>
        </div>
      )}
      
      <div className={cn(
        "w-full transition-all",
        hasResult ? "max-w-2xl" : "max-w-xl"
      )}>
        <div className={cn(
          "flex items-center space-x-2 mb-4",
          hasResult ? "justify-start" : "justify-center"
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

          <div className="relative ml-auto">
            <button
              onClick={toggleModelSelector}
              className={cn(
                "flex items-center justify-center px-4 py-2 rounded-full cursor-pointer transition-all",
                "bg-gray-50 hover:bg-gray-100 text-gray-700"
              )}
            >
              <span className="text-sm">{model === 'openai' ? 'OpenAI' : model === 'groq' ? 'Groq' : 'Mistral'}</span>
            </button>
            
            {showModelSelector && (
              <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-lg border border-gray-200 z-10">
                <div className="p-2 w-40">
                  <button
                    onClick={() => selectModel('openai')}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-sm transition-colors",
                      model === 'openai' ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                    )}
                  >
                    OpenAI
                  </button>
                  <button
                    onClick={() => selectModel('groq')}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-sm transition-colors",
                      model === 'groq' ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                    )}
                  >
                    Groq
                  </button>
                  <button
                    onClick={() => selectModel('mistral')}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-sm transition-colors",
                      model === 'mistral' ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                    )}
                  >
                    Mistral
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={cn(
          "relative group transition-all",
          hasResult ? "" : "mx-auto"
        )}>
          <div className="flex items-center">
            <div className={cn(
              "relative w-full",
              hasResult ? "rounded-lg shadow-sm" : "rounded-full shadow-lg"
            )}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Search a ${language === 'en' ? 'English' : 'German'} word or ask a question...`}
                className={cn(
                  "w-full pl-12 pr-12 py-4 text-lg transition-all focus:outline-none",
                  hasResult 
                    ? "border border-gray-200 focus:border-blue-500 rounded-lg" 
                    : "border-0 focus:shadow-md rounded-full shadow-md hover:shadow-lg"
                )}
              />
              {query.trim() && (
                <>
                  <button
                    onClick={() => speakText(query, language)}
                    className="absolute right-12 top-1/2 -translate-y-1/2 rounded-full p-2 transition-all text-gray-500 hover:bg-gray-100"
                    title="Listen to pronunciation"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
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
                </>
              )}
            </div>
          </div>
        </div>

        {!hasResult && !loading && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Search for words, phrases, idioms, or ask language questions</p>
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

        {result && !error && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="font-bold text-xl text-gray-900">{result.title}</h3>
                <button
                  onClick={() => speakText(result.title, language)}
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
                <ReactMarkdown>{result.answer}</ReactMarkdown>
              </div>
              <div className="mt-3 text-xs text-right text-gray-500">
                Answered by {result.modelUsed ? 
                  (result.modelUsed === 'openai' ? 'OpenAI' : 
                   result.modelUsed === 'groq' ? 'Groq' : 'Mistral') : 
                  (model === 'openai' ? 'OpenAI' : 
                   model === 'groq' ? 'Groq' : 'Mistral')
                }
              </div>
            </div>
            
            {followUpMessages.map((message, index) => (
              <div key={index} className="space-y-4">
                <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-700 font-medium">{message.question}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown>{message.answer}</ReactMarkdown>
                  </div>
                  <div className="mt-3 text-xs text-right text-gray-500">
                    Answered by {message.modelUsed ? 
                      (message.modelUsed === 'openai' ? 'OpenAI' : 
                       message.modelUsed === 'groq' ? 'Groq' : 'Mistral') : 
                      (model === 'openai' ? 'OpenAI' : 
                       model === 'groq' ? 'Groq' : 'Mistral')
                    }
                  </div>
                </div>
              </div>
            ))}
            
            <div className="relative">
              <input
                type="text"
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                onKeyDown={handleFollowUpKeyDown}
                placeholder="Ask a follow-up question..."
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleFollowUpSubmit}
                disabled={followUpLoading || !followUpQuestion.trim()}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 transition-all",
                  followUpLoading || !followUpQuestion.trim()
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-50"
                )}
              >
                {followUpLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="mt-2">
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm border border-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
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