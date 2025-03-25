'use client';

import { useState } from 'react';
import { Cloud, Download, Upload, Database } from 'lucide-react';
import { authenticateWithGoogle, backupToGoogleDrive, restoreFromGoogleDrive } from '@/lib/googleDrive';
import { backupToFirestore, restoreFromFirestore } from '@/lib/firestore';

export default function BackupPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [backupType, setBackupType] = useState<'google' | 'firestore' | null>(null);

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      const success = await authenticateWithGoogle();
      if (success) {
        setIsAuthenticated(true);
        setMessage('Successfully authenticated with Google Drive');
      } else {
        setMessage('Authentication failed. Please try again.');
      }
    } catch (error) {
      setMessage('Failed to authenticate: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!userName && backupType === 'firestore') {
      setMessage('Please enter your name to backup to Firestore');
      return;
    }

    setIsLoading(true);
    try {
      let success = false;
      if (backupType === 'google') {
        success = await backupToGoogleDrive();
      } else if (backupType === 'firestore') {
        success = await backupToFirestore(userName);
      }

      if (success) {
        setMessage(`Successfully backed up library to ${backupType === 'google' ? 'Google Drive' : 'Firestore'}`);
      } else {
        setMessage(`Failed to backup library. Please try again.`);
      }
    } catch (error) {
      setMessage('Failed to upload: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!userName && backupType === 'firestore') {
      setMessage('Please enter your name to restore from Firestore');
      return;
    }

    setIsLoading(true);
    try {
      let success = false;
      if (backupType === 'google') {
        success = await restoreFromGoogleDrive();
      } else if (backupType === 'firestore') {
        success = await restoreFromFirestore(userName);
      }

      if (success) {
        setMessage(`Successfully downloaded library from ${backupType === 'google' ? 'Google Drive' : 'Firestore'}`);
      } else {
        setMessage(`Failed to download library. Please try again.`);
      }
    } catch (error) {
      setMessage('Failed to download: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="flex flex-col items-center mb-8">
        <Cloud className="w-16 h-16 text-primary-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Backup Library</h1>
        <p className="text-gray-600 text-center mt-2">
          Sync your word library with Google Drive or Firestore
        </p>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {!backupType ? (
          <>
            <button
              onClick={() => setBackupType('google')}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg flex items-center justify-center"
            >
              <img src="/google-drive-icon.svg" alt="Google Drive" className="w-5 h-5 mr-2" />
              Backup to Google Drive
            </button>
            
            <button
              onClick={() => setBackupType('firestore')}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg flex items-center justify-center"
            >
              <Database className="w-5 h-5 mr-2" />
              Backup to Firestore
            </button>
          </>
        ) : backupType === 'google' ? (
          <>
            {!isAuthenticated ? (
              <button
                onClick={handleAuth}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg flex items-center justify-center"
              >
                <img src="/google-drive-icon.svg" alt="Google Drive" className="w-5 h-5 mr-2" />
                {isLoading ? 'Connecting...' : 'Connect to Google Drive'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {isLoading ? 'Uploading...' : 'Backup to Google Drive'}
                </button>
                
                <button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isLoading ? 'Downloading...' : 'Restore from Google Drive'}
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your name"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center"
            >
              <Upload className="w-5 h-5 mr-2" />
              {isLoading ? 'Uploading...' : 'Backup to Firestore'}
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              {isLoading ? 'Downloading...' : 'Restore from Firestore'}
            </button>
          </>
        )}

        <button
          onClick={() => {
            setBackupType(null);
            setUserName('');
            setIsAuthenticated(false);
          }}
          className="w-full text-gray-600 hover:text-gray-800 font-medium py-2"
        >
          Change Backup Method
        </button>
      </div>
    </div>
  );
} 