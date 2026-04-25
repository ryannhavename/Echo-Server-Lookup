// types/minecraft.ts
export interface MCServerResponse {
  ip: string;
  port: number;
  debug?: {
    ping: boolean;
    query: boolean;
    srv: boolean;
    querymismatch: boolean;
    ipinsrv: boolean;
    cnameinsrv: boolean;
    animatedmotd: boolean;
    cachetime: number;
    apiversion: number;
  };
  online: boolean;
  hostname?: string;
  version?: string;
  protocol?: number;
  players?: {
    online: number;
    max: number;
    list?: Player[];
  };
  motd?: {
    raw: string[];
    clean: string[];
    html: string[];
  };
  icon?: string;
  software?: string;
  map?: string;
  gamemode?: string;
  plugins?: string[];
  mods?: string[];
  info?: {
    raw?: string[];
    clean?: string[];
    html?: string[];
  };
  eula_blocked?: boolean;
}

export interface Player {
  name: string;
  uuid: string;
}

export interface ServerData {
  ip: string;
  data: MCServerResponse;
  timestamp: number;
}

export interface SearchHistory {
  ip: string;
  timestamp: number;
  status: 'online' | 'offline';
}

export interface WHOISData {
  status: string;
  message?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string; // ASN info (e.g., "AS13335 Cloudflare, Inc.")
  asname?: string;
  query?: string;
  reverse?: string; // Reverse DNS
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
}

export interface CombinedServerData {
  minecraft: MCServerResponse;
  whois: WHOISData | null;
}
