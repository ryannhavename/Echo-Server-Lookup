// app/api/whois/route.ts - Server-side WHOIS lookup via ipinfo.io

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ipParam = searchParams.get('ip');

  if (!ipParam) {
    return NextResponse.json(
      { error: 'Missing IP parameter' },
      { status: 400 }
    );
  }

  // Strip port if present (e.g., "mcpvp.club:25565" -> "mcpvp.club")
  const ip = ipParam.split(':')[0];

  if (!ip) {
    return NextResponse.json(
      { error: 'Invalid IP parameter' },
      { status: 400 }
    );
  }

  // Validate format - accept IPv4 or domain
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

  if (!ipv4Regex.test(ip) && !domainRegex.test(ip)) {
    return NextResponse.json(
      { error: 'Invalid IP or domain format' },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json`, {
      headers: {
        'User-Agent': 'Echo-Server-Lookup/1.0',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`ipinfo.io error: ${res.status}`);
    }

    const data = await res.json();

    // Mapping response ipinfo.io ke format WHOISData
    const mappedData: Record<string, unknown> = {
      status: 'success',
      query: data.ip || ip,
      city: data.city || undefined,
      regionName: data.region || undefined,
      country: data.country || undefined,
      timezone: data.timezone || undefined,
      org: data.org || undefined,
      isp: data.org || undefined,
      reverse: data.hostname || undefined,
      mobile: false,
      proxy: false,
      hosting: data.org?.toLowerCase().includes('hosting') || false,
    };

    // Parse ASN from org field
    if (data.org) {
      mappedData.as = data.org;
      mappedData.asname = data.org.split(' ').slice(1).join(' ');
    }

    // Parse lat/lon from loc field
    if (data.loc) {
      const [lat, lon] = data.loc.split(',').map(parseFloat);
      if (!isNaN(lat) && !isNaN(lon)) {
        mappedData.lat = lat;
        mappedData.lon = lon;
      }
    }

    return NextResponse.json(mappedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('WHOIS fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WHOIS data', status: 'fail' },
      { status: 500 }
    );
  }
}
