'use client';

import { useState, useCallback, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Gamepad2, Server, Zap } from 'lucide-react';
import { fetchCombinedData } from '@/lib/api';
import type { MCServerResponse, WHOISData } from '@/types/minecraft';
import { isValidIP, parseIpPort } from '@/lib/minecraft';
import { SearchBar } from './SearchBar';
import { ServerDataCard } from './ServerDataCard';
import { ServerSkeleton } from './ServerSkeleton';
import { useSearchHistory } from './ServerLookupHistory';

const LATENCY_API = '/api/latency';

export function ServerLookup() {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverData, setServerData] = useState<MCServerResponse | null>(null);
  const [whoIsData, setWhoIsData] = useState<WHOISData | null>(null);
  const [copied, setCopied] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [measuringLatency, setMeasuringLatency] = useState(false);

  const [isPending, startTransition] = useTransition();

  const {
    history,
    showHistory,
    setShowHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
  } = useSearchHistory();

  const measureLatency = useCallback(async (targetIp: string): Promise<number> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const edgePromise = fetch(`${LATENCY_API}?target=${encodeURIComponent(targetIp)}`, {
        cache: 'no-cache',
        signal: controller.signal,
      }).then(res => res.json());

      const directStart = performance.now();
      const directPromise = fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(targetIp)}`, {
        cache: 'no-cache',
        signal: controller.signal,
      }).then(() => Math.round(performance.now() - directStart));

      const result = await Promise.race([edgePromise, directPromise]);
      clearTimeout(timeout);

      if (typeof result === 'number' && result < 5000) return result;
      if (result?.latency && result.latency < 5000) return result.latency;
      return 999;
    } catch {
      clearTimeout(timeout);
      return 999;
    }
  }, []);

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
        addToHistory(trimmedIp, 'offline');
      } else {
        setServerData(minecraft);
        setWhoIsData(whois);
        addToHistory(trimmedIp, 'online');

        setMeasuringLatency(true);
        try {
          const latencyMs = await measureLatency(minecraft.ip || trimmedIp);
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
  }, [ip, measureLatency, addToHistory]);

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

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{ willChange: 'transform' }}>
        <div className="absolute top-[25%] left-[25%] w-96 h-96 bg-blue-500/5 rounded-full blur-xl" style={{ transform: 'translateZ(0)' }} />
        <div className="absolute bottom-[25%] right-[25%] w-96 h-96 bg-purple-500/5 rounded-full blur-xl" style={{ transform: 'translateZ(0)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-2xl" style={{ transform: 'translateZ(0)' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="22" fill="black"/>
                <rect x="1" y="1" width="98" height="98" rx="21" stroke="#333" strokeWidth="2"/>
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
            <span className="font-medium">Powered by EchoAgent Core, Ryan&apos;s</span>
          </div>
        </motion.div>

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

        {/* Loading State - Skeleton */}
        <AnimatePresence>
          {loading && <ServerSkeleton />}
        </AnimatePresence>

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
