// app/api/whois/route.ts - Server-side WHOIS lookup via ip-api.com
// Menghindari mixed content & rate limit dengan memproses di server

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
    const res = await fetch(`https://ip-api.com/json/${encodeURIComponent(ip)}`, {
      headers: {
        'User-Agent': 'Echo-Server-Lookup/1.0',
      },
      // Cache selama 5 menit
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`WHOIS API error: ${res.status}`);
    }

    const data = await res.json();

    if (data.status !== 'success') {
      return NextResponse.json(
        { error: data.message || 'WHOIS lookup failed' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('WHOIS fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WHOIS data' },
      { status: 500 }
    );
  }
}
