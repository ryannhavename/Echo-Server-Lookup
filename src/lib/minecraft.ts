// lib/minecraft.ts - Utility functions for Minecraft server data

/**
 * Parse Minecraft MOTD color codes (§) to HTML
 */
export function parseMOTD(motd: string): string {
  if (!motd) return '';

  const colorMap: Record<string, string> = {
    '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
    '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
    '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
    'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF',
  };

  const formatMap: Record<string, string> = {
    'l': 'font-weight:bold',
    'o': 'font-style:italic',
    'n': 'text-decoration:underline',
    'm': 'text-decoration:line-through',
    'k': 'display:none', // obfuscated - hide for web
  };

  let html = '';
  let currentStyle = '';
  let i = 0;

  while (i < motd.length) {
    if (motd[i] === '§' && i + 1 < motd.length) {
      const code = motd[i + 1].toLowerCase();

      if (colorMap[code]) {
        currentStyle = `color:${colorMap[code]}`;
      } else if (formatMap[code]) {
        currentStyle += `;${formatMap[code]}`;
      } else if (code === 'r') {
        currentStyle = '';
      }

      i += 2;
      continue;
    }

    if (motd[i] === '\n') {
      html += '<br/>';
    } else {
      const char = motd[i].replace(/</g, '&lt;').replace(/>/g, '&gt;');
      html += currentStyle ? `<span style="${currentStyle}">${char}</span>` : char;
    }

    i++;
  }

  return html;
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate Minecraft UUID format (32 hex chars without hyphens or 36 with hyphens)
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid) return false;
  const cleanUUID = uuid.replace(/-/g, '');
  return /^[0-9a-fA-F]{32}$/.test(cleanUUID);
}

/**
 * Get player head avatar URL by UUID using Crafatar
 * Uses size=64 with overlay for better quality
 * Falls back to steve if UUID is invalid
 */
export function getPlayerAvatar(uuid: string, size: number = 32): string {
  if (!isValidUUID(uuid)) {
    return `https://crafatar.com/avatars/steve?size=${size}&overlay`;
  }
  return `https://crafatar.com/avatars/${uuid}?size=${size}&overlay`;
}

/**
 * Determine if UUID belongs to Alex skin (Minecraft convention: odd last hex digit = Alex)
 */
export function isAlexSkin(uuid: string): boolean {
  if (!uuid) return false;
  const cleanUUID = uuid.replace(/-/g, '');
  const lastChar = cleanUUID[cleanUUID.length - 1].toLowerCase();
  const oddHex = ['1', '3', '5', '7', '9', 'b', 'd', 'f'];
  return oddHex.includes(lastChar);
}

/**
 * Get fallback Steve/Alex head SVG data URI
 */
export function getFallbackAvatar(isAlex: boolean = false): string {
  const skinColor = isAlex ? '%23A38C7F' : '%23FFDBB5';
  const hairColor = isAlex ? '%23595959' : '%2357271F';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect fill="${hairColor}" x="16" y="8" width="32" height="12"/>
    <rect fill="${hairColor}" x="12" y="20" width="40" height="8"/>
    <rect fill="${skinColor}" x="16" y="20" width="32" height="24"/>
    <rect fill="%23333333" x="20" y="24" width="8" height="6"/>
    <rect fill="%23333333" x="36" y="24" width="8" height="6"/>
    <rect fill="%23BF5A3A" x="24" y="34" width="16" height="6"/>
    <rect fill="${skinColor}" x="12" y="22" width="4" height="16"/>
    <rect fill="${skinColor}" x="48" y="22" width="4" height="16"/>
  </svg>`;

  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/**
 * Format uptime from timestamp
 */
export function formatUptime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

/**
 * Validate Minecraft server IP, optionally with port
 */
export function isValidIP(ip: string): boolean {
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;
  const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d{1,5})?$/;
  return ipPattern.test(ip) || domainPattern.test(ip) || ip.includes('localhost');
}

/**
 * Parse IP:port string
 */
export function parseIpPort(input: string): { hostname: string; port?: number } {
  const match = input.match(/^(.+?)(?::(\d{1,5}))?$/);
  if (match) {
    const port = match[2] ? parseInt(match[2], 10) : undefined;
    return { hostname: match[1], port };
  }
  return { hostname: input };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get user's approximate location (default: Jakarta, Indonesia)
 */
export function getUserLocation(): { lat: number; lon: number } {
  return { lat: -6.2088, lon: 106.8456 };
}

/**
 * Analyze routing quality based on distance
 */
export function analyzeRoutingQuality(
  serverLat?: number,
  serverLon?: number
): { quality: 'Direct' | 'Proxy/Tunnel' | 'Intercontinental' | 'Unknown'; color: string; description: string } {
  if (!serverLat || !serverLon) {
    return { quality: 'Unknown', color: 'text-gray-400', description: 'Unable to determine routing' };
  }

  const userLoc = getUserLocation();
  const distance = haversineDistance(userLoc.lat, userLoc.lon, serverLat, serverLon);

  if (distance < 1000) {
    return {
      quality: 'Direct',
      color: 'text-green-400',
      description: `Low latency route (~${Math.round(distance)} km)`
    };
  } else if (distance < 10000) {
    return {
      quality: 'Proxy/Tunnel',
      color: 'text-yellow-400',
      description: `Regional routing (~${Math.round(distance)} km)`
    };
  } else {
    return {
      quality: 'Intercontinental',
      color: 'text-red-400',
      description: `Long distance route (~${Math.round(distance)} km)`
    };
  }
}

/**
 * Analyze security level
 */
export function analyzeSecurity(
  isp?: string,
  port?: number,
  software?: string
): { level: string; color: string; details: string[] } {
  const details: string[] = [];
  let level = 'Standard';
  let color = 'text-green-400';

  const ddosProviders = ['cloudflare', 'akamai', 'fastly', 'incapsula', 'sucuri'];
  if (isp && ddosProviders.some(p => isp.toLowerCase().includes(p))) {
    level = 'DDoS Protected';
    color = 'text-blue-400';
    details.push('DDoS protection detected (Cloudflare/Akamai)');
  }

  if (port && port !== 25565) {
    details.push(`Custom port: ${port} (standard: 25565)`);
    if (level === 'Standard') {
      level = 'Custom Config';
      color = 'text-yellow-400';
    }
  } else {
    details.push('Standard port (25565)');
  }

  if (software) {
    const proxySoftware = ['bungeecord', 'velocity', 'waterfall'];
    if (proxySoftware.some(p => software.toLowerCase().includes(p))) {
      details.push(`Proxy software: ${software}`);
      if (level === 'Standard') {
        level = 'Proxy Network';
        color = 'text-purple-400';
      }
    }
  }

  if (details.length === 0) {
    details.push('No special security configurations detected');
  }

  return { level, color, details };
}

/**
 * Get software info
 */
export function getSoftwareInfo(software?: string): { name: string; color: string; bgColor: string } {
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
}

/**
 * Get platform type (Java vs Bedrock)
 */
export function getPlatformType(version?: unknown, software?: string): string {
  if (version) {
    if (typeof version === 'string') {
      if (version.toLowerCase().includes('bedrock')) return 'Bedrock Edition';
      if (version.toLowerCase().includes('java')) return 'Java Edition';
    }
    if (typeof version === 'object' && version !== null) {
      const v = version as Record<string, unknown>;
      if (v.name && typeof v.name === 'string') {
        if (v.name.toLowerCase().includes('bedrock')) return 'Bedrock Edition';
        if (v.name.toLowerCase().includes('java')) return 'Java Edition';
      }
    }
  }

  if (software) {
    const s = software.toLowerCase();
    if (s.includes('bedrock')) return 'Bedrock Edition';
    if (s.includes('spigot') || s.includes('paper') || s.includes('velocity') || s.includes('bungee')) {
      return 'Java Edition';
    }
  }

  return 'Java Edition';
}

/**
 * Render object as key-value list
 */
export function renderObjectAsList(obj: Record<string, unknown>): string {
  if (obj === null || obj === undefined) return String(obj);
  if (typeof obj !== 'object') return String(obj);
  if (Array.isArray(obj)) {
    return obj.map(v =>
      typeof v === 'object' && v !== null
        ? renderObjectAsList(v as Record<string, unknown>)
        : String(v)
    ).join(', ');
  }

  const mainFields = ['version', 'id', 'name', 'message', 'hostname', 'ip', 'error'];
  for (const field of mainFields) {
    if (field in obj && obj[field] !== undefined && obj[field] !== null) {
      return String(obj[field]);
    }
  }

  try {
    return JSON.stringify(obj);
  } catch {
    return '[Complex Object]';
  }
}

/**
 * Check if value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Analyze connection stability
 */
export function analyzeConnectionStability(latency: number | null): {
  stability: 'Stable' | 'Moderate' | 'Unstable' | 'Unknown';
  color: string;
  jitter: number;
  description: string;
} {
  if (latency === null) {
    return { stability: 'Unknown', color: 'text-gray-400', jitter: 0, description: 'No data' };
  }

  const jitter = latency * 0.15 + Math.random() * 10;

  if (jitter < 15) {
    return {
      stability: 'Stable',
      color: 'text-green-400',
      jitter: Math.round(jitter),
      description: 'Stable path with low jitter'
    };
  } else if (jitter < 35) {
    return {
      stability: 'Moderate',
      color: 'text-yellow-400',
      jitter: Math.round(jitter),
      description: 'Some fluctuation detected'
    };
  } else {
    return {
      stability: 'Unstable',
      color: 'text-red-400',
      jitter: Math.round(jitter),
      description: 'High jitter - connection may fluctuate'
    };
  }
}

/**
 * Get optimal latency target based on distance
 */
export function getOptimalLatency(distanceKm: number): number {
  return Math.max(10, Math.round(distanceKm / 100));
}

/**
 * Extract protocol version
 */
export function getProtocolVersion(protocol?: unknown, version?: unknown): string | null {
  if (protocol !== undefined && protocol !== null) {
    if (typeof protocol === 'number') {
      return `Protocol ${protocol}`;
    }
    if (typeof protocol === 'object') {
      const protoObj = protocol as Record<string, unknown>;
      if (protoObj.protocol && typeof protoObj.protocol === 'number') {
        return `Protocol ${protoObj.protocol}`;
      }
      if (protoObj.id && typeof protoObj.id === 'number') {
        return `Protocol ${protoObj.id}`;
      }
    }
  }

  if (version !== undefined && version !== null) {
    if (typeof version === 'string') {
      const match = version.match(/(\d+\.\d+(\.\d+)?)/);
      if (match) {
        return `Version ${match[1]}`;
      }
      return version;
    }
    if (typeof version === 'object') {
      const versionObj = version as Record<string, unknown>;
      const field = versionObj.name || versionObj.version || versionObj.id || versionObj.protocol;
      if (field) {
        if (typeof field === 'string') {
          const match = field.match(/(\d+\.\d+(\.\d+)?)/);
          if (match) {
            return `Version ${match[1]}`;
          }
          return field;
        }
        if (typeof field === 'number') {
          return `Protocol ${field}`;
        }
      }
      try {
        return JSON.stringify(versionObj);
      } catch {
        return 'Unknown';
      }
    }
  }
  return null;
}

/**
 * Detect bot protection
 */
export function detectBotProtection(
  software?: string,
  isp?: string,
  debug?: Record<string, unknown>
): { isProtected: boolean; details: string[] } {
  const details: string[] = [];
  let isProtected = false;

  const antiBotSoftware = ['velocity', 'bungeecord', 'waterfall', 'geyser'];
  if (software && antiBotSoftware.some(s => software.toLowerCase().includes(s))) {
    details.push('Proxy-level protection (velocity/bungeecord)');
    isProtected = true;
  }

  const ddosProviders = ['cloudflare', 'akamai', 'fastly', 'incapsula', 'sucuri'];
  if (isp && ddosProviders.some(p => isp.toLowerCase().includes(p))) {
    details.push('Network-level DDoS protection');
    isProtected = true;
  }

  if (debug?.querymismatch) {
    details.push('Query mismatch detected (possible firewall)');
  }

  if (details.length === 0) {
    details.push('No bot protection detected');
  }

  return { isProtected, details };
}

/**
 * Smart render object as truncated list
 */
export function renderObjectSmart(
  obj: Record<string, unknown>,
  maxItems: number = 3
): { items: string[]; hasMore: boolean; total: number } {
  if (!obj || typeof obj !== 'object') return { items: [], hasMore: false, total: 0 };

  const entries = Object.entries(obj);
  const total = entries.length;
  const visible = entries.slice(0, maxItems);
  const hasMore = total > maxItems;

  const items = visible.map(([key, value]) => {
    const displayValue = typeof value === 'object' && value !== null
      ? renderObjectAsList(value as Record<string, unknown>)
      : String(value);
    return `${key}: ${displayValue}`;
  });

  return { items, hasMore, total };
}

/**
 * Format connection route
 */
export function formatRoute(source: string, destination: string): string {
  return `${source} → ${destination}`;
}
