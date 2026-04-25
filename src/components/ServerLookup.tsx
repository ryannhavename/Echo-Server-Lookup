'use client';

import { useState, useCallback, useEffect, useTransition, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Gamepad2, Server, Zap } from 'lucide-react';
import { fetchCombinedData } from '@/lib/api';
import type { MCServerResponse, WHOISData } from '@/types/minecraft';
import { isValidIP, parseIpPort } from '@/lib/minecraft';
import { SearchBar } from './SearchBar';
import { ServerDataCard } from './ServerDataCard';

const LATENCY_API = '/api/latency';
const PING_API = '/api/ping';

export function ServerLookup() {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverData, setServerData] = useState<MCServerResponse | null>(null);
  const [whoIsData, setWhoIsData] = useState<WHOISData | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [measuringLatency, setMeasuringLatency] = useState(false);

  // Use useTransition for non-urgent UI updates
  const [isPending, startTransition] = useTransition();

  // Load history from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('echo-server-lookup-history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          startTransition(() => {
            setHistory(parsed.filter(item => typeof item === 'string').slice(0, 8));
          });
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Save history to localStorage (debounced)
  useEffect(() => {
    if (history.length === 0) return;
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem('echo-server-lookup-history', JSON.stringify(history));
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(timeout);
  }, [history]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('echo-server-lookup-history');
    setShowHistory(false);
  }, []);

  // Remove single item from history
  const removeFromHistory = useCallback((ip: string) => {
    setHistory(prev => prev.filter(item => item !== ip));
  }, []);

  // Optimized latency measurement - single fetch strategy
  const measureLatency = useCallback(async (targetIp: string): Promise<number> => {
    try {
      // Single latency check via edge API
      const res = await fetch(`${LATENCY_API}?target=${encodeURIComponent(targetIp)}`, {
        cache: 'no-cache',
      });
      const data = await res.json();
      if (data.latency && data.latency < 5000) {
        return data.latency;
      }
    } catch { /* ignore */ }

    // Fallback: direct fetch timing
    const start = performance.now();
    try {
      await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(targetIp)}`, {
        cache: 'no-cache',
      });
    } catch { /* ignore */ }
    const ms = Math.round(performance.now() - start);
    return ms < 5000 ? ms : 999;
  }, []);

  // Handle search with optimistic updates
  const handleSearch = useCallback(async (searchIp: string = ip) => {
    if (!searchIp.trim()) return;

    const trimmedIp = searchIp.trim();

    if (!isValidIP(trimmedIp)) {
      setError('Invalid IP address or domain format');
      return;
    }

    const parsed = parseIpPort(trimmedIp);
    const lookupIp = parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.hostname;

    setLoading(true);
    setError(null);
    setServerData(null);
    setWhoIsData(null);

    try {
      const { minecraft, whois } = await fetchCombinedData(lookupIp);

      if (!minecraft || (!minecraft.online && !minecraft.hostname)) {
        setError(`Server "${searchIp}" not found or is offline`);
        // Optimistic history update
        setHistory(prev => [searchIp, ...prev.filter(h => h !== searchIp)].slice(0, 8));
      } else {
        setServerData(minecraft);
        setWhoIsData(whois);
        // Optimistic history update
        setHistory(prev => [searchIp, ...prev.filter(h => h !== searchIp)].slice(0, 8));

        setMeasuringLatency(true);
        try {
          const latencyMs = await measureLatency(minecraft.ip || searchIp.trim());
          setLatency(latencyMs);
        } catch {
          setLatency(null);
        } finally {
          setMeasuringLatency(false);
        }
      }
    } catch {
      setError('Failed to fetch server data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [ip, measureLatency]);

  // Copy IP with feedback
  const handleCopyIP = useCallback(async () => {
    if (!serverData?.ip) return;
    try {
      const { copyToClipboard } = await import('@/lib/minecraft');
      const success = await copyToClipboard(serverData.ip);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* ignore */ }
  }, [serverData?.ip]);

  // ServerDataCard props - only pass when serverData exists

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Background Effects - GPU accelerated with transform */}
      <div className="fixed inset-0 pointer-events-none" style={{ willChange: 'transform' }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-xl" style={{ transform: 'translateZ(0)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-xl" style={{ transform: 'translateZ(0)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-2xl" style={{ transform: 'translateZ(0)' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header - GPU accelerated animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              {/* Ukuran dinaikkan ke 44 agar lebih dominan */}
              <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="22" fill="black"/>
                <rect x="1" y="1" width="98" height="98" rx="21" stroke="#333" strokeWidth="2"/>
            
                {/* Path "E" di-scale lebih besar agar tidak 'kekecilan' */}
                <path d="M22 32H78L73 41H22V32Z" fill="white"/>
                <path d="M22 46H66L61 55H22V46Z" fill="white" fillOpacity={0.8}/>
                <path d="M22 60H78L73 69H22V60Z" fill="white"/>
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Echo Server Lookup
            </h1>
          </div>
          <p className="text-gray-400 text-lg font-medium">
            High-performance Minecraft server analytics platform
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
            <Zap className="w-4 h-4 opacity-70" />
            <span className="font-medium">Powered by EchoAgent Core, Ryan's</span>
          </div>
        </motion.div>

        {/* Search Bar */}
        <SearchBar
          ip={ip}
          setIp={setIp}
          loading={loading}
          history={history}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          onSearch={handleSearch}
          onClearHistory={clearHistory}
          onRemoveFromHistory={removeFromHistory}
        />

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-xl flex items-center gap-3"
              style={{ willChange: 'transform, opacity' }}
            >
              <AlertTriangle className="w-5 h-5 opacity-70 text-red-400 flex-shrink-0" />
              <p className="text-red-300 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
              style={{ willChange: 'opacity' }}
            >
              <div className="relative">
                <div className="w-16 h-16 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"
                  style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="mt-4 text-gray-400 font-medium">Analyzing server...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Server Data Card */}
        <AnimatePresence>
          {serverData && !loading && (
            <ServerDataCard
              serverData={serverData}
              whoIsData={whoIsData}
              latency={latency}
              measuringLatency={measuringLatency}
              onCopyIP={handleCopyIP}
              copied={copied}
            />
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!serverData && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
            style={{ willChange: 'opacity' }}
          >
            <div className="inline-flex p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl mb-6">
              <Gamepad2 className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Search Minecraft Server
            </h3>
            <p className="text-gray-500 max-w-md mx-auto font-medium">
              Enter a Minecraft server IP address or domain to view complete statistics, players, and network information.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
