// app/api/latency/route.ts - Server-side latency measurement
// Dijalankan di Vercel Serverless (region: sin/hkg untuk Asia)

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Gunakan Edge Runtime untuk latency lebih rendah & region distribusi

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('target');

  if (!target) {
    return NextResponse.json({ error: 'Missing target parameter' }, { status: 400 });
  }

  // Parse target (support IP:Port)
  const [host, portStr] = target.split(':');
  const port = portStr ? parseInt(portStr) : 25565;

  // Gunakan fetch dengan abort controller untuk timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const start = performance.now();

  try {
    // Coba TCP handshake via fetch ke port Minecraft
    // Meskipun server tidak merespons HTTP, TCP connect time memberikan estimasi latency
    const url = `http://${host}:${port}`;
    const signal = controller.signal;

    // Lakukan request dengan signal untuk timeout
    const fetchPromise = fetch(url, {
      method: 'HEAD',
      signal,
      cache: 'no-store' as RequestCache,
    });

    const response = await fetchPromise;
    clearTimeout(timeout);

    const end = performance.now();
    const latency = Math.round(end - start);

    return NextResponse.json({
      latency,
      source: 'edge-server',
      target: host,
      port,
      region: 'auto', // Vercel Edge otomatis pilih region terdekat
    });
  } catch (error: unknown) {
    clearTimeout(timeout);

    // Jika abort (timeout), kembalikan nilai tinggi
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        latency: 999,
        source: 'edge-server',
        target: host,
        port,
        error: 'timeout',
      });
    }

    // Untuk error koneksi lainnya, ukur waktu hingga error
    const end = performance.now();
    const latency = Math.round(end - start);

    return NextResponse.json({
      latency: latency < 10 ? 10 : latency, // Minimal 10ms untuk koneksi gagal
      source: 'edge-server',
      target: host,
      port,
      error: 'connection-failed',
    });
  }
}
