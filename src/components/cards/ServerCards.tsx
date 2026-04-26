'use client';

import type { MCServerResponse, WHOISData } from '@/types/minecraft';
import {
  Users, Globe, Activity, Copy, ExternalLink, AlertTriangle,
  CheckCircle2, Wifi, ShieldCheck, ChevronRight, Server
} from 'lucide-react';
import {
  analyzeRoutingQuality, analyzeSecurity,
  getPlatformType, getProtocolVersion, getOptimalLatency,
  haversineDistance, getUserLocation, copyToClipboard
} from '@/lib/minecraft';
import { PlayerGrid } from '@/components/PlayerGrid';
import { MOTDRenderer } from '@/components/MOTDRenderer';

// --- ServerHeader ---
export function ServerHeader({ serverData, onCopyIP, copied }: {
  serverData: MCServerResponse;
  onCopyIP: () => void;
  copied: boolean;
}) {
  return (
    <div className="p-6 border-b border-white/5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {serverData.icon && (
            <img
              src={serverData.icon}
              alt="Server Icon"
              className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.02] object-cover"
            />
          )}
          <div className={`w-3 h-3 rounded-full ${serverData.online ? 'bg-green-500' : 'bg-red-500'} animate-pulse flex-shrink-0`} />
          <div>
            <h2 className="text-2xl font-bold text-white">
              {serverData.hostname || serverData.ip}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                serverData.online
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {serverData.online ? 'Online' : 'Offline'}
              </span>
              {serverData.version && (
                <span className="text-xs text-gray-400 font-medium">
                  {typeof serverData.version === 'string'
                    ? serverData.version
                    : (serverData.version as any)?.name?.toString() || 'Unknown'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopyIP}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-sm font-medium cursor-pointer"
            style={{ touchAction: 'manipulation' }}
          >
            <Copy className="w-4 h-4 opacity-70" />
            {copied ? 'Copied!' : serverData.ip}
          </button>
          <a
            href={`https://mcsrvstat.us/server/${serverData.ip}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
            style={{ touchAction: 'manipulation' }}
          >
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
}

// --- ServerStatsGrid ---
export function ServerStatsGrid({ serverData, whoIsData, latency, measuringLatency }: {
  serverData: MCServerResponse;
  whoIsData: WHOISData | null;
  latency: number | null;
  measuringLatency: boolean;
}) {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Players */}
      {serverData.players && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 opacity-70 text-blue-400" />
            <h3 className="font-semibold text-gray-200">Players</h3>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-white">{serverData.players.online}</span>
            <span className="text-gray-400 mb-1 font-medium">/ {serverData.players.max}</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: `${Math.min((serverData.players.online / serverData.players.max) * 100, 100)}%` }}
            />
          </div>
          {serverData.players.list && serverData.players.list.length > 0 && (
            <div className="mt-4">
              <PlayerGrid players={serverData.players.list} />
            </div>
          )}
        </div>
      )}

      {/* Network Info */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 opacity-70 text-green-400" />
          <h3 className="font-semibold text-gray-200">Network</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">IP Address</span>
            <button
              onClick={() => serverData.ip && copyToClipboard(serverData.ip)}
              className="text-blue-400 hover:text-blue-300 font-mono font-medium transition-colors cursor-pointer"
              style={{ touchAction: 'manipulation' }}
            >
              {serverData.ip}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Port</span>
            <span className="text-white font-mono font-medium">{serverData.port || 25565}</span>
          </div>
        </div>
      </div>

      {/* Latency */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wifi className="w-5 h-5 opacity-70 text-purple-400" />
          <h3 className="font-semibold text-gray-200">Your Latency</h3>
        </div>
        {measuringLatency ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <span className="text-gray-400 text-sm font-medium">Measuring...</span>
          </div>
        ) : latency !== null ? (
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${
              latency < 80 ? 'text-green-400' : latency < 160 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {latency}
            </span>
            <span className={`text-sm font-medium ${
              latency < 80 ? 'text-green-400' : latency < 160 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              ms
            </span>
          </div>
        ) : (
          <span className="text-gray-500 text-sm font-medium">N/A</span>
        )}
      </div>

      {/* Bot Protection */}
      {whoIsData ? (
        <BotProtectionCard whoIsData={whoIsData} serverData={serverData} />
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 opacity-70 text-gray-500" />
            <h3 className="font-semibold text-gray-500">Bot Protection</h3>
          </div>
          <div className="text-xs text-gray-600 font-medium">Data unavailable</div>
        </div>
      )}

      {/* Connection Analysis */}
      {whoIsData ? (
        <ConnectionAnalysisCard whoIsData={whoIsData} latency={latency} />
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 opacity-70 text-gray-500" />
            <h3 className="font-semibold text-gray-500">Connection Analysis</h3>
          </div>
          <div className="text-xs text-gray-600 font-medium">Data unavailable</div>
        </div>
      )}

      {/* Server Info */}
      <ServerInfoCard serverData={serverData} />
    </div>
  );
}

// --- BotProtectionCard ---
export function BotProtectionCard({ whoIsData, serverData }: { whoIsData: WHOISData; serverData: MCServerResponse }) {
  const getBotProtectionStatus = () => {
    const isp = whoIsData.isp?.toLowerCase() || '';
    const org = whoIsData.org?.toLowerCase() || '';
    const fullText = `${isp} ${org} ${whoIsData.as?.toLowerCase() || ''}`;

    const enterpriseProviders = ['cloudflare', 'akamai', 'imperva', 'aws shield', 'azure ddos', 'google cloud armor'];
    const advancedProviders = ['fastly', 'g-core labs', 'ddos-guard', 'ovh', 'ovhcloud', 'stackpath', 'cdn77'];

    const allProviders = [...enterpriseProviders, ...advancedProviders];
    const foundProviders = allProviders.filter(p => fullText.includes(p));

    const hasEnterprise = foundProviders.some(p => enterpriseProviders.includes(p));
    const hasAdvanced = foundProviders.some(p => advancedProviders.includes(p));

    if (foundProviders.length > 0) {
      let status, color, tierDetails;

      if (hasEnterprise) {
        status = 'Enterprise Protected';
        color = 'text-blue-400';
        tierDetails = 'Enterprise-grade (10+ Tbps capacity)';
      } else if (hasAdvanced) {
        status = 'Advanced Protected';
        color = 'text-cyan-400';
        tierDetails = 'Advanced protection (1+ Tbps capacity)';
      } else {
        status = 'DDoS Protected';
        color = 'text-green-400';
        tierDetails = 'Standard DDoS protection';
      }

      return {
        status,
        color,
        details: [`DDoS protection: ${foundProviders.join(', ')}`, tierDetails]
      };
    }

    if (serverData.software) {
      const software = serverData.software.toLowerCase();
      if (software.includes('velocity') || software.includes('bungee') || software.includes('waterfall')) {
        return { status: 'Proxy Protection', color: 'text-blue-400', details: [`Proxy software: ${serverData.software}`, 'Limited built-in protection'] };
      }
    }

    return { status: 'Standard', color: 'text-gray-400', details: ['No advanced protection', 'Vulnerable to DDoS <10Gbps'] };
  };

  const protection = getBotProtectionStatus();
  const hostingType = whoIsData.mobile ? 'Mobile' : whoIsData.hosting ? 'Datacenter' : whoIsData.isp ? 'Residential' : null;
  const connectionType = serverData.debug?.srv ? 'SRV Record' : 'Direct IP';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 opacity-70 text-green-400" />
        <h3 className="font-semibold text-gray-200">Bot Protection</h3>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Protection Status</span>
          <span className={`font-medium ${protection.color} flex items-center gap-1.5`}>
            {protection.status === 'Protected' && <ShieldCheck className="w-3.5 h-3.5" />}
            <span className={protection.status === 'Protected' ? 'drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : ''}>
              {protection.status}
            </span>
          </span>
        </div>

        {whoIsData.isp && (
          <div className="flex justify-between items-center gap-2">
            <span className="text-gray-400 font-medium">Provider</span>
            <span className="text-white font-mono text-xs font-medium truncate max-w-[200px]" title={whoIsData.isp}>
              {whoIsData.isp}
            </span>
          </div>
        )}

        {hostingType && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Hosting Type</span>
            <span className={`font-mono text-xs font-medium ${
              hostingType === 'Datacenter' ? 'text-blue-400' : hostingType === 'Mobile' ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {hostingType}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Connection</span>
          <span className={`font-mono text-xs font-medium ${connectionType === 'SRV Record' ? 'text-green-400' : 'text-yellow-400'}`}>
            {connectionType}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- ConnectionAnalysisCard ---
export function ConnectionAnalysisCard({ whoIsData, latency }: { whoIsData: WHOISData; latency: number | null }) {
  const routing = analyzeRoutingQuality(whoIsData.lat, whoIsData.lon);
  const distance = (whoIsData.lat && whoIsData.lon)
    ? Math.round(haversineDistance(getUserLocation().lat, getUserLocation().lon, whoIsData.lat, whoIsData.lon))
    : null;
  const optimalLatency = distance ? getOptimalLatency(distance) : null;
  const security = analyzeSecurity(whoIsData.isp, undefined, undefined);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 opacity-70 text-orange-400" />
        <h3 className="font-semibold text-gray-200">Connection Analysis</h3>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <div className="text-gray-400 text-xs mb-1 font-medium">Routing Quality</div>
          <div className={`font-bold ${routing.color}`}>{routing.quality}</div>
          <div className="text-gray-500 text-xs mt-0.5 font-medium">{routing.description}</div>

          {optimalLatency !== null && latency !== null && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <div className="text-gray-400 text-xs mb-1 font-medium">Routing Performance</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Target:</span>
                <span className="text-green-400 font-medium">{optimalLatency}ms</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-500 font-medium">Actual:</span>
                <span className={latency < optimalLatency * 1.5 ? 'text-green-400 font-medium' : latency < optimalLatency * 2 ? 'text-yellow-400 font-medium' : 'text-red-400 font-medium'}>
                  {latency}ms
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${latency < optimalLatency * 1.5 ? 'bg-green-500' : latency < optimalLatency * 2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${latency > 0 ? Math.min((optimalLatency / latency) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-1 font-medium">Security Level</div>
          <div className={`font-bold ${security.color}`}>{security.level}</div>
        </div>
      </div>
    </div>
  );
}

// --- ServerInfoCard ---
export function ServerInfoCard({ serverData }: { serverData: MCServerResponse }) {
  const getSoftwareInfoSafe = (software?: string) => {
    if (!software) return { name: 'Unknown', color: 'text-gray-400', bgColor: 'bg-gray-500/10' };
    const s = software.toLowerCase();
    if (s.includes('paper')) return { name: 'Paper', color: 'text-blue-400', bgColor: 'bg-blue-500/10' };
    if (s.includes('spigot')) return { name: 'Spigot', color: 'text-orange-400', bgColor: 'bg-orange-500/10' };
    if (s.includes('velocity')) return { name: 'Velocity', color: 'text-purple-400', bgColor: 'bg-purple-500/10' };
    if (s.includes('bungee')) return { name: 'BungeeCord', color: 'text-red-400', bgColor: 'bg-red-500/10' };
    if (s.includes('waterfall')) return { name: 'Waterfall', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' };
    if (s.includes('fabric')) return { name: 'Fabric', color: 'text-green-400', bgColor: 'bg-green-500/10' };
    if (s.includes('forge')) return { name: 'Forge', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' };
    if (s.includes('bedrock')) return { name: 'Bedrock', color: 'text-sky-400', bgColor: 'bg-sky-500/10' };
    return { name: software, color: 'text-gray-300', bgColor: 'bg-gray-500/10' };
  };

  const getVersionSafe = (version: unknown): string => {
    if (typeof version === 'string') return version;
    if (version && typeof version === 'object') {
      const v = version as Record<string, unknown>;
      return String(v?.name || v?.version || v?.id || 'Unknown');
    }
    return 'Unknown';
  };

  const softwareInfo = serverData.software ? getSoftwareInfoSafe(serverData.software) : null;
  const protocolVersion = getProtocolVersion(undefined, serverData.version);
  const platformType = getPlatformType(serverData.version, serverData.software);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 opacity-70 text-purple-400" />
        <h3 className="font-semibold text-gray-200">Server Info</h3>
      </div>
      <div className="space-y-2 text-sm">
        {serverData.version && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Version</span>
            <span className="text-white font-mono text-xs font-medium">
              {getVersionSafe(serverData.version)}
            </span>
          </div>
        )}

        {softwareInfo && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Core Engine</span>
              <span className={`${softwareInfo.color} font-medium flex items-center gap-1`}>
                <span className={`w-2 h-2 rounded-full ${softwareInfo.bgColor} inline-block`}></span>
                {softwareInfo.name}
              </span>
            </div>
            {protocolVersion && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Protocol</span>
                <span className="text-white font-mono text-xs font-medium">{protocolVersion}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Platform</span>
              <span className="text-white font-mono text-xs font-medium">{platformType}</span>
            </div>
          </>
        )}

        {serverData.gamemode && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Gamemode</span>
            <span className="text-white font-medium">{serverData.gamemode}</span>
          </div>
        )}
        {serverData.map && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Map</span>
            <span className="text-white font-medium">{serverData.map}</span>
          </div>
        )}
        {serverData.eula_blocked !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">EULA Status</span>
            <span className={serverData.eula_blocked ? 'text-red-400 font-medium' : 'text-green-400 font-medium'}>
              {serverData.eula_blocked ? 'Blocked' : 'Compliant'}
            </span>
          </div>
        )}
        {serverData.debug?.cachetime && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Last Fetch</span>
            <span className="text-white font-mono text-xs font-medium">
              {new Date(serverData.debug.cachetime * 1000).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- WhoisSection ---
export function WhoisSection({ whoIsData, serverData }: { whoIsData: WHOISData; serverData: MCServerResponse }) {
  return (
    <div className="px-6 py-4 border-t border-white/5 w-full overflow-hidden">
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-gray-300 transition-colors font-medium touch-action-manipulation">
          <ChevronRight className="w-4 h-4 opacity-60 group-open:rotate-90 transition-transform" />
          WHOIS / Network Data
        </summary>

        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-2 font-medium">WHOIS / Network Data</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
            <WhoisGridItem label="IP Address" value={serverData.ip} color="text-white" monospace />
            {whoIsData.as && <WhoisGridItem label="ASN" value={whoIsData.as} color="text-purple-400" monospace />}
            {whoIsData.isp && <WhoisGridItem label="ISP" value={whoIsData.isp} color="text-green-400" monospace truncate />}
            {whoIsData.org && whoIsData.org !== whoIsData.isp && (
              <WhoisGridItem label="Organization" value={whoIsData.org} color="text-blue-400" monospace truncate />
            )}
            <WhoisGridItem
              label="Hosting Type"
              value={whoIsData.mobile ? 'Mobile' : whoIsData.hosting ? 'Datacenter' : whoIsData.isp ? 'Residential' : 'Unknown'}
              color={whoIsData.hosting ? 'text-blue-400' : whoIsData.mobile ? 'text-yellow-400' : 'text-green-400'}
            />
            <WhoisGridItem
              label="Connection"
              value={serverData.debug?.srv ? 'SRV Record' : 'Direct IP'}
              color={serverData.debug?.srv ? 'text-green-400' : 'text-yellow-400'}
            />
            {whoIsData.as?.toLowerCase().includes('cloudflare') && (
              <WhoisGridItem label="Abuse Contact" value="abuse@cloudflare.com" color="text-cyan-400" monospace />
            )}
            {whoIsData.reverse && (
              <WhoisGridItem label="Reverse DNS" value={whoIsData.reverse} color="text-cyan-400" monospace small truncate />
            )}
            {whoIsData.query && <WhoisGridItem label="Query IP" value={whoIsData.query} color="text-white" monospace />}
            {whoIsData.timezone && <WhoisGridItem label="Timezone" value={whoIsData.timezone} color="text-pink-400" monospace />}
            {whoIsData.lat && whoIsData.lon && (
              <WhoisGridItem label="Coordinates" value={`${whoIsData.lat}, ${whoIsData.lon}`} color="text-orange-400" monospace />
            )}
          </div>
        </div>
      </details>
    </div>
  );
}

// --- WhoisGridItem ---
export function WhoisGridItem({ label, value, color, monospace, truncate, small }: {
  label: string;
  value: string;
  color: string;
  monospace?: boolean;
  truncate?: boolean;
  small?: boolean;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 hover:border-white/10 transition-colors">
      <div className="text-gray-500 font-medium">{label}</div>
      <div className={`${small ? 'text-[10px]' : 'text-[11px]'} font-medium ${truncate ? 'truncate' : ''} ${monospace ? 'font-mono' : ''} ${color}`}>
        {value}
      </div>
    </div>
  );
}
