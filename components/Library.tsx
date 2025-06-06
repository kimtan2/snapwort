'use client';

import { useState } from 'react';
import { db, type Word, type FollowUp } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Book, Trash2, Search, ChevronDown, ChevronUp, Volume2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { speakText } from '@/lib/textToSpeech';

export function Library() {
  const [activeTab, setActiveTab] = useState<'en' | 'de'>('en');
  const [expandedWords, setExpandedWords] = useState<Set<number>>(new Set());
  const [expandedChats, setExpandedChats] = useState<Set<number>>(new Set());
  
  const words = useLiveQuery<Word[]>(
    () => db.words
      .where('language')
      .equals(activeTab)
      .sortBy('createdAt', word => word.reverse()),
    [activeTab]
  );

  const handleDelete = async (id?: number) => {
    if (id) {
      await db.words.delete(id);
    }
  };

  const toggleWord = (id: number) => {
    setExpandedWords(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleChat = (id: number) => {
    setExpandedChats(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Word Library</h1>
          <div className="text-sm font-medium text-gray-500">
            {words?.length || 0} {words?.length === 1 ? 'word' : 'words'}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-1 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('en')}
              className={cn(
                'flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all',
                activeTab === 'en'
                  ? 'bg-white shadow-soft text-primary-700'
                  : 'text-gray-600 hover:text-primary-600'
              )}
            >
              English
            </button>
            <button
              onClick={() => setActiveTab('de')}
              className={cn(
                'flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all',
                activeTab === 'de'
                  ? 'bg-white shadow-soft text-primary-700'
                  : 'text-gray-600 hover:text-primary-600'
              )}
            >
              German
            </button>
          </div>
        </div>

        {!words || words.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="bg-gray-50 inline-flex rounded-full p-3 mb-4">
              <Book className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium text-lg mb-2">No words saved yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Search for words to add them to your library and they will appear here
            </p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Search className="h-4 w-4 mr-2" />
              Search for words
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {words.map((word: Word) => (
              <div
                key={word.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div 
                  className="p-5 hover:bg-gray-50 transition-all cursor-pointer"
                  onClick={() => word.id && toggleWord(word.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg text-gray-900">{word.word}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(word.word, word.language);
                        }}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="h-4 w-4 text-gray-500" />
                      </button>
                      {word.followUpHistory && word.followUpHistory.length > 0 && (
                        <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          <span className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {word.followUpHistory.length}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500">
                        {new Date(word.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {word.id && expandedWords.has(word.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {word.id && expandedWords.has(word.id) && (
                  <div className="px-5 pb-5">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{word.meaning}</ReactMarkdown>
                    </div>
                    
                    {word.followUpHistory && word.followUpHistory.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (word.id) {
                              toggleChat(word.id);
                            }
                          }}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          {expandedChats.has(word.id || 0) ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Hide follow-up questions
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Show {word.followUpHistory.length} follow-up {word.followUpHistory.length === 1 ? 'question' : 'questions'}
                            </>
                          )}
                        </button>
                        
                        {expandedChats.has(word.id || 0) && (
                          <div className="mt-3 space-y-3">
                            {word.followUpHistory.map((followUp: FollowUp, index: number) => (
                              <div key={index} className="space-y-2">
                                <div className="bg-gray-100 rounded-lg p-3 text-sm">
                                  <p className="font-medium text-gray-700">{followUp.question}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-sm">
                                  <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{followUp.answer}</ReactMarkdown>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          if (word.id) {
                            handleDelete(word.id);
                          }
                        }}
                        className="text-xs flex items-center text-red-600 hover:text-red-800 font-medium"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 