// app/api/history/route.ts - Real-time historical data API
// Menggunakan Edge Runtime untuk latensi rendah

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const currentPlayers = parseInt(request.nextUrl.searchParams.get('players') || '0');
  const maxPlayers = parseInt(request.nextUrl.searchParams.get('max') || '100');

  // Generate real-time historical data based on current time
  // In production, this would fetch from Time-Series DB (InfluxDB, TimescaleDB)
  const now = Date.now();
  const data: Array<{
    timestamp: number;
    players: number;
    latency: number;
  }> = [];

  for (let i = 23; i >= 0; i--) {
    const time = now - i * 60 * 60 * 1000;
    const date = new Date(time);
    const hour = date.getUTCHours(); // Use UTC for consistency

    // Realistic player patterns based on time of day (UTC)
    const baseMultiplier = hour >= 18 && hour <= 23 ? 0.85 + Math.random() * 0.15
      : hour >= 9 && hour <= 17 ? 0.65 + Math.random() * 0.2
      : 0.3 + Math.random() * 0.2;

    const players = Math.max(0, Math.min(maxPlayers,
      Math.round(currentPlayers * baseMultiplier + (Math.random() - 0.5) * currentPlayers * 0.15)
    ));

    // Simulate latency with jitter
    const baseLatency = 20 + Math.random() * 30;
    const jitter = (Math.random() - 0.5) * 15;
    const latency = Math.round(Math.max(5, baseLatency + jitter));

    data.push({
      timestamp: time,
      players,
      latency,
    });
  }

  // Override last point with current data
  if (data.length > 0) {
    data[data.length - 1].players = currentPlayers;
  }

  return NextResponse.json({
    data,
    generatedAt: now,
  });
}
