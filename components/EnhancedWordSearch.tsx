import React, { useState } from 'react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Search, Book, ArrowRight, Bookmark, LoaderCircle, Volume2, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { speakText } from '@/lib/textToSpeech';

type Language = 'en' | 'de';

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
  const [result, setResult] = useState<LanguageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [followUpMessages, setFollowUpMessages] = useState<FollowUpMessage[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [wordId, setWordId] = useState<number | undefined>(undefined);

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
          language
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
          previousContext
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

  const hasResult = result || error;

  // Enhanced Loading Animation component with gradient card and bubbles
  const LoadingAnimation = () => {
    // Generate random bubbles
    const bubbles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 14 + 4,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: Math.random() * 8 + 6,
      opacity: Math.random() * 0.5 + 0.1
    }));

    return (
      <div className="my-6 overflow-hidden">
        <div className="relative w-full h-64 flex items-center justify-center">
          {/* Background with bubbles */}
          <div className="absolute inset-0 overflow-hidden z-0">
            {bubbles.map(bubble => (
              <div 
                key={bubble.id}
                className="absolute rounded-full"
                style={{
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  left: `${bubble.left}%`,
                  bottom: `-${bubble.size}px`,
                  opacity: bubble.opacity,
                  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(173, 216, 230, 0.4))',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
                  animation: `bubbleRise ${bubble.duration}s ease-in ${bubble.delay}s infinite`
                }}
              />
            ))}
          </div>
          
          {/* Beautiful gradient card that swings vertically */}
          <div 
            className="relative w-[65%] h-[70%] rounded-xl shadow-lg z-10 overflow-hidden"
            style={{
              animation: 'cardSwing 3s ease-in-out infinite',
              perspective: '1000px',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Gradient background for card */}
            <div className="absolute inset-0" 
                 style={{
                   background: 'linear-gradient(135deg, #9333ea, #4f46e5, #818cf8, #8b5cf6, #c026d3)',
                   animation: 'gradientShift 8s ease infinite'
                 }}>
            </div>
            
            {/* Shimmering overlay */}
            <div className="absolute inset-0"
                 style={{
                   background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                   animation: 'shimmerMove 3s ease-in-out infinite'
                 }}>
            </div>
            
            {/* Card content */}
            <div className="absolute inset-0 flex flex-col justify-center p-6">
              {/* Animated lines */}
              <div className="h-4 w-[70%] bg-white bg-opacity-20 rounded-full mb-4" 
                   style={{ animation: 'pulseLine 1.5s ease-in-out infinite' }}></div>
              <div className="h-4 w-[85%] bg-white bg-opacity-20 rounded-full mb-4" 
                   style={{ animation: 'pulseLine 1.5s ease-in-out 0.2s infinite' }}></div>
              <div className="h-4 w-[60%] bg-white bg-opacity-20 rounded-full mb-4" 
                   style={{ animation: 'pulseLine 1.5s ease-in-out 0.4s infinite' }}></div>
              <div className="h-4 w-[75%] bg-white bg-opacity-20 rounded-full" 
                   style={{ animation: 'pulseLine 1.5s ease-in-out 0.6s infinite' }}></div>
              
              {/* Glowing dot */}
              <div className="absolute w-5 h-5 rounded-full bg-white bg-opacity-80 top-5 right-5"
                   style={{ animation: 'glowPulse 2s ease-in-out infinite' }}></div>
            </div>
          </div>
          
          {/* Loading text */}
          <div className="absolute bottom-4 text-center text-sm font-medium"
               style={{ color: '#8b5cf6', animation: 'textFade 2s ease-in-out infinite' }}>
            Analyzing knowledge...
          </div>
        </div>
      </div>
    );
  };

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

        {loading && !hasResult && <LoadingAnimation />}

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
              {result.modelUsed && (
                <div className="mt-3 text-xs text-right text-gray-500">
                  Answered by {result.modelUsed === 'openai' ? 'OpenAI' : 
                              result.modelUsed === 'groq' ? 'Groq' : 
                              result.modelUsed === 'mistral-agent' ? 'Mistral Agent' : 
                              result.modelUsed}
                </div>
              )}
            </div>
            
            {followUpMessages.map((message, index) => (
              <div key={index} className="space-y-4">
                <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-700 font-medium">{message.question}</p>
                </div>
                {followUpLoading && index === followUpMessages.length - 1 ? (
                  <LoadingAnimation />
                ) : (
                  <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                    <div className="prose prose-lg max-w-none">
                      <ReactMarkdown>{message.answer}</ReactMarkdown>
                    </div>
                    {message.modelUsed && (
                      <div className="mt-3 text-xs text-right text-gray-500">
                        Answered by {message.modelUsed === 'openai' ? 'OpenAI' : 
                                   message.modelUsed === 'groq' ? 'Groq' : 
                                   message.modelUsed === 'mistral-agent' ? 'Mistral Agent' : 
                                   message.modelUsed}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {followUpLoading && followUpMessages.length === 0 && (
              <LoadingAnimation />
            )}
            
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
    
      {/* Add keyframes for animations */}
      <style jsx global>{`
        @keyframes cardSwing {
          0% { transform: perspective(1000px) rotateX(3deg); }
          50% { transform: perspective(1000px) rotateX(-3deg); }
          100% { transform: perspective(1000px) rotateX(3deg); }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes shimmerMove {
          0% { transform: translateY(-50%) scale(1.5); opacity: 0.6; }
          50% { transform: translateY(0%) scale(1); opacity: 0.2; }
          100% { transform: translateY(50%) scale(1.5); opacity: 0.6; }
        }
        
        @keyframes pulseLine {
          0% { opacity: 0.3; transform: scaleX(0.97); }
          50% { opacity: 0.7; transform: scaleX(1); }
          100% { opacity: 0.3; transform: scaleX(0.97); }
        }
        
        @keyframes bubbleRise {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: var(--bubble-opacity, 0.3); }
          80% { opacity: var(--bubble-opacity, 0.3); }
          100% { transform: translateY(-600px); opacity: 0; }
        }
        
        @keyframes glowPulse {
          0% { box-shadow: 0 0 2px 1px rgba(255, 255, 255, 0.6); }
          50% { box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.8); }
          100% { box-shadow: 0 0 2px 1px rgba(255, 255, 255, 0.6); }
        }
        
        @keyframes textFade {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}