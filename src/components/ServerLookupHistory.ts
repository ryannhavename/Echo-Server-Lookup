import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'echo-server-lookup-history';
const MAX_HISTORY = 8;

export interface HistoryItem {
  ip: string;
  status: 'online' | 'offline';
  timestamp: number;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        // Validate structure
        if (Array.isArray(parsed) && parsed.every(item => 
          typeof item.ip === 'string' && 
          (item.status === 'online' || item.status === 'offline') &&
          typeof item.timestamp === 'number'
        )) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load search history:', e);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save search history:', e);
    }
  }, [history]);

  // Add new search to history
  const addToHistory = useCallback((ip: string, status: 'online' | 'offline') => {
    setHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(item => item.ip !== ip);
      // Add new item at beginning
      const newHistory = [
        { ip, status, timestamp: Date.now() },
        ...filtered
      ];
      // Limit to MAX_HISTORY items
      return newHistory.slice(0, MAX_HISTORY);
    });
  }, []);

  // Remove single item from history
  const removeFromHistory = useCallback((ip: string) => {
    setHistory(prev => prev.filter(item => item.ip !== ip));
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    history,
    showHistory,
    setShowHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
