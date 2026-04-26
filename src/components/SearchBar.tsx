'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, X, History, Trash2 } from 'lucide-react';
import type { HistoryItem } from './ServerLookupHistory';

interface SearchBarProps {
  ip: string;
  setIp: (ip: string) => void;
  loading: boolean;
  history: HistoryItem[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  onSearch: (searchIp?: string) => void;
  onClearHistory: () => void;
  onRemoveFromHistory: (ip: string) => void;
}

const ICON_SIZE_SM = 'w-4 h-4 opacity-70';

export function SearchBar({
  ip,
  setIp,
  loading,
  history,
  showHistory,
  setShowHistory,
  onSearch,
  onClearHistory,
  onRemoveFromHistory,
}: SearchBarProps) {
  const [inputFocused, setInputFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8 relative"
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all" />
        <div className="relative flex items-center gap-2 p-2 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl">
          <div className="pl-4">
            <Globe className={ICON_SIZE_SM + " text-gray-400"} />
          </div>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Enter Minecraft server IP or domain..."
            onFocus={() => {
              setInputFocused(true);
              if (history.length > 0) setShowHistory(true);
            }}
            onBlur={() => setTimeout(() => {
              setInputFocused(false);
              setShowHistory(false);
            }, 200)}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg py-3"
          />
          {ip && (
            <button
              onClick={() => setIp('')}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              style={{ touchAction: 'manipulation' }}
            >
              <X className={ICON_SIZE_SM} />
            </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors relative cursor-pointer"
            style={{ touchAction: 'manipulation' }}
          >
            <History className={ICON_SIZE_SM + " text-gray-400"} />
            {mounted && history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] flex items-center justify-center">
                {history.length}
              </span>
            )}
          </button>
          <button
            onClick={() => onSearch()}
            disabled={loading || !ip.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer"
            style={{ touchAction: 'manipulation' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className={ICON_SIZE_SM} />
            )}
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* History Dropdown */}
      <AnimatePresence>
        {showHistory && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="absolute top-full left-0 right-0 mt-2 z-[60]"
          >
            <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400 font-medium">Recent Searches</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearHistory();
                  }}
                  className="flex items-center gap-1 px-3 py-1 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors text-xs font-medium text-red-400 cursor-pointer"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              </div>

              {history.map((item, idx) => (
                <div
                  key={`${item.ip}-${idx}`}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors group"
                >
                  <button
                    onClick={() => {
                      setIp(item.ip);
                      setShowHistory(false);
                      onSearch(item.ip);
                    }}
                    className="flex-1 flex items-center gap-3 text-left cursor-pointer"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span className={`text-sm font-medium ${item.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                      {item.ip}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromHistory(item.ip);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <X className="w-3 h-3 text-gray-500 hover:text-red-400 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
