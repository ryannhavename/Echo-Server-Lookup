'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Activity, Users, TrendingUp, ChevronRight } from 'lucide-react';

interface DataPoint {
  time: string;
  players: number;
  latency: number;
  timestamp: number;
}

// Custom Tooltip with Glassmorphism
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
      <div className="text-xs text-gray-400 font-medium mb-1">{label}</div>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: entry.name === 'players' ? '#3b82f6' : '#a855f7',
              boxShadow: entry.name === 'players'
                ? '0 0 6px rgba(59,130,246,0.6)'
                : '0 0 6px rgba(168,85,247,0.6)',
            }}
          />
          <span className="text-gray-300 font-medium">
            {entry.name === 'players' ? 'Players' : 'Latency'}:
          </span>
          <span className="text-white font-mono font-medium">
            {entry.name === 'players' ? entry.value : `${entry.value}ms`}
          </span>
        </div>
      ))}
    </div>
  );
}

export const HistoricalPerformance = memo(function HistoricalPerformance({
  currentPlayers,
  maxPlayers,
  currentLatency,
}: {
  currentPlayers: number;
  maxPlayers: number;
  currentLatency: number | null;
}) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'players' | 'latency'>('players');
  const [error, setError] = useState<string | null>(null);

  // Format time to 12-hour with AM/PM
  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        players: currentPlayers.toString(),
        max: maxPlayers.toString(),
      });

      const res = await fetch(`/api/history?${params.toString()}`, {
        cache: 'no-cache',
      });

      if (!res.ok) throw new Error('Failed to fetch history');

      const json = await res.json();

      if (json.data && Array.isArray(json.data)) {
        const formattedData = json.data.map((item: { timestamp: number; players: number; latency: number }) => ({
          time: formatTime(item.timestamp),
          players: item.players,
          latency: item.latency,
          timestamp: item.timestamp,
        }));
        setData(formattedData);
      }
    } catch (err) {
      console.error('History fetch error:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [currentPlayers, maxPlayers, formatTime]);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  const chartColor = chartType === 'players' ? '#3b82f6' : '#a855f7';
  const chartGradient = chartType === 'players'
    ? ['rgba(59,130,246,0.3)', 'rgba(59,130,246,0.05)']
    : ['rgba(168,85,247,0.3)', 'rgba(168,85,247,0.05)'];

  return (
    <div className="px-6 py-4 border-t border-white/5">
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-gray-300 transition-colors font-medium">
          <ChevronRight className="w-4 h-4 opacity-60 group-open:rotate-90 transition-transform" />
          <Activity className="w-4 h-4 opacity-70" />
          Historical Performance
        </summary>

        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-3 font-medium">
            Historical Performance (24h) - Local Time
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 mb-4 flex-wrap">
            <button
              onClick={() => setChartType('players')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chartType === 'players'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              <Users className="w-3 h-3" />
              Player Trend
            </button>
            <button
              onClick={() => setChartType('latency')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chartType === 'latency'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              Latency Stability
            </button>
          </div>

          {/* Chart Area */}
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="h-48 flex items-center justify-center text-sm text-red-400 font-medium">
              {error}
            </div>
          ) : (
            <div className="h-48 w-full" style={{ willChange: 'transform' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartGradient[0]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={chartGradient[1]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="time"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    interval="preserveStartEnd"
                    tickFormatter={(value) => value}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={chartType}
                    stroke={chartColor}
                    strokeWidth={2}
                    fill="url(#colorGradient)"
                    filter="drop-shadow(0 0 6px rgba(59,130,246,0.4))"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500 font-medium">
            <span>Last 24 hours (Local Time)</span>
            <span className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: chartColor,
                  boxShadow: `0 0 6px ${chartColor}`,
                }}
              />
              {chartType === 'players' ? 'Player Count' : 'Latency (ms)'}
            </span>
          </div>
        </div>
      </details>
    </div>
  );
});
