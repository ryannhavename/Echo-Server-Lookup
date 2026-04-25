// lib/api.ts - Fetch server data from MCSrvStat API and WHOIS

import type { MCServerResponse, WHOISData } from '@/types/minecraft';

const MCSRVSTAT_API = 'https://api.mcsrvstat.us/3';
const IP_API = 'https://ip-api.com/json';

export async function fetchServerData(ip: string): Promise<MCServerResponse | null> {
  try {
    const res = await fetch(`${MCSRVSTAT_API}/${encodeURIComponent(ip)}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      headers: {
        'User-Agent': 'Echo-Server-Lookup/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: MCServerResponse = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch server data:', error);
    return null;
  }
}

export async function fetchWhoisData(ip: string): Promise<WHOISData | null> {
  try {
    const res = await fetch(`${IP_API}/${encodeURIComponent(ip)}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes (WHOIS data doesn't change often)
      headers: {
        'User-Agent': 'Echo-Server-Lookup/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: WHOISData = await res.json();

    // Check if the API returned an error status
    if (data.status !== 'success') {
      console.warn('WHOIS API returned non-success status:', data.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch WHOIS data:', error);
    return null;
  }
}

// Chained fetch: First get Minecraft data, then use resolved IP for WHOIS
export async function fetchCombinedData(input: string): Promise<{
  minecraft: MCServerResponse | null;
  whois: WHOISData | null;
}> {
  const minecraft = await fetchServerData(input);

  if (!minecraft || (!minecraft.online && !minecraft.hostname)) {
    return { minecraft, whois: null };
  }

  // Use the resolved IP from MCSrvStat for WHOIS lookup
  const ipForWhois = minecraft.ip || input;
  const whois = await fetchWhoisData(ipForWhois);

  return { minecraft, whois };
}
