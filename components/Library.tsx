import { useState } from 'react';
import { db, type Word } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function Library() {
  const [activeTab, setActiveTab] = useState<'en' | 'de'>('en');
  
  const words = useLiveQuery<Word[]>(
    () => db.words
      .where('language')
      .equals(activeTab)
      .sortBy('createdAt', word => word.reverse()),
    [activeTab]
  );

  return (
    <div className="px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Word Library</h1>
      
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('en')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'en'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setActiveTab('de')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'de'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          German
        </button>
      </div>

      {!words || words.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No words saved yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Search for words to add them to your library
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {words.map((word: Word) => (
            <div
              key={word.id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
            >
              <h3 className="font-medium text-lg text-gray-900">{word.word}</h3>
              <p className="text-gray-700 mt-2">{word.meaning}</p>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {new Date(word.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => word.id && db.words.delete(word.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 