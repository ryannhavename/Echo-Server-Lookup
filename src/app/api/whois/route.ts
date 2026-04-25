// app/api/whois/route.ts - Server-side WHOIS lookup via ipinfo.io
// ipinfo.io lebih stabil di Vercel Edge dibanding ip-api.com

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');

  if (!ip) {
    return NextResponse.json(
      { error: 'Missing IP parameter' },
      { status: 400 }
    );
  }

  // Validasi format IP sederhana
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return NextResponse.json(
      { error: 'Invalid IP format' },
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

    // ipinfo.io tidak punya status field, jadi kita asumsikan sukses jika ada response
    // Mapping response ipinfo.io ke format WHOISData yang sudah ada
    const mappedData: Record<string, unknown> = {
      status: 'success',
      query: data.ip || ip,
      city: data.city || undefined,
      regionName: data.region || undefined,
      country: data.country || undefined,
      timezone: data.timezone || undefined,
      org: data.org || undefined,
      isp: data.org || undefined, // org biasanya berisi ISP info
      reverse: data.hostname || undefined,
      mobile: false,
      proxy: false,
      hosting: data.org?.toLowerCase().includes('hosting') || false,
    };

    // Parse ASN dari org field (format: "AS15169 Google LLC")
    if (data.org) {
      mappedData.as = data.org;
      mappedData.asname = data.org.split(' ').slice(1).join(' ');
    }

    // Parse lat/lon dari loc field (format: "37.4056,-122.0775")
    if (data.loc) {
      const [lat, lon] = data.loc.split(',').map(parseFloat);
      mappedData.lat = lat;
      mappedData.lon = lon;
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
