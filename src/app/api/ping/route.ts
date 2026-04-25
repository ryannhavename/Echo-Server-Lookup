// app/api/ping/route.ts - Lightweight baseline ping untuk mengukur RTT User -> Vercel Edge
// Menggunakan Edge Runtime untuk latensi terendah

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Timestamp': Date.now().toString(),
    },
  });
}
