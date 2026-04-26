// lib/api.ts - Fetch server data from MCSrvStat API and WHOIS (via server-side API route)

import type { MCServerResponse, WHOISData } from '@/types/minecraft';

const MCSRVSTAT_API = 'https://api.mcsrvstat.us/3';
const FETCH_TIMEOUT = 10000; // 10 second timeout

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs: number = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

export async function fetchServerData(ip: string): Promise<MCServerResponse | null> {
  try {
    const res = await fetchWithTimeout(`${MCSRVSTAT_API}/${encodeURIComponent(ip)}`, {
      headers: {
        'User-Agent': 'Echo-Server-Lookup/1.0',
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
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
  // Strip port if present (e.g., "mcpvp.club:25565" -> "mcpvp.club")
  const ipClean = ip.split(':')[0];

  try {
    const res = await fetchWithTimeout(`/api/whois?ip=${encodeURIComponent(ipClean)}`, {
      headers: {
        'User-Agent': 'Echo-Server-Lookup/1.0',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
      if (res.status === 429) {
        console.warn('WHOIS API rate limit reached');
      }
      return null;
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

/**
 * Fetch combined data: First get Minecraft data, then use resolved IP for WHOIS
 * Serial approach to ensure WHOIS uses clean IP (without port)
 */
export async function fetchCombinedData(input: string): Promise<{
  minecraft: MCServerResponse | null;
  whois: WHOISData | null;
}> {
  // First, get Minecraft data to resolve IP
  const minecraft = await fetchServerData(input);

  if (!minecraft || (!minecraft.online && !minecraft.hostname)) {
    return { minecraft, whois: null };
  }

  // Use the resolved IP from MCSrvStat for WHOIS (strip port if present)
  const ipForWhois = (minecraft.ip || input).split(':')[0];

  // Fetch WHOIS with clean IP
  const whois = await fetchWhoisData(ipForWhois);

  return { minecraft, whois };
}
