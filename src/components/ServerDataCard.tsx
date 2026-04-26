'use client';

import type { MCServerResponse, WHOISData } from '@/types/minecraft';
import { ServerHeader, ServerStatsGrid, WhoisSection } from './cards/ServerCards';
import { HistoricalPerformance } from './HistoricalPerformance';

interface ServerDataCardProps {
  serverData: MCServerResponse;
  whoIsData: WHOISData | null;
  latency: number | null;
  measuringLatency: boolean;
  onCopyIP: () => void;
  copied: boolean;
}

export function ServerDataCard({
  serverData, whoIsData, latency, measuringLatency, onCopyIP, copied
}: ServerDataCardProps) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-xl glass-card">
      <ServerHeader serverData={serverData} onCopyIP={onCopyIP} copied={copied} />

      {serverData.motd && (
        <div className="px-6 py-4 border-b border-white/5">
          <MOTDRenderer motd={serverData.motd} />
        </div>
      )}

      <ServerStatsGrid
        serverData={serverData}
        whoIsData={whoIsData}
        latency={latency}
        measuringLatency={measuringLatency}
      />

      {whoIsData ? (
        <WhoisSection whoIsData={whoIsData} serverData={serverData} />
      ) : (
        <div className="px-6 py-4 border-t border-white/5">
          <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
            <Globe className="w-3 h-3 opacity-50" />
            WHOIS data unavailable (rate limited or connection failed)
          </div>
        </div>
      )}

      <HistoricalPerformance
        currentPlayers={serverData.players?.online ?? 0}
        maxPlayers={serverData.players?.max ?? 0}
        currentLatency={latency}
      />

      <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Clock className="w-4 h-4 opacity-70" />
          <span>Data cached for 60 seconds</span>
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Optimized for latency and performance. Powered by EchoAgent Core.
        </div>
      </div>
    </div>
  );
}

// Import Globe, Clock for footer
import { Globe, Clock } from 'lucide-react';
import { MOTDRenderer } from './MOTDRenderer';
