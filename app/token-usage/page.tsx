'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Zap, MessageSquare, ArrowUpRight, ArrowDownRight, Clock, Calendar, RotateCcw, Trash2 } from 'lucide-react';

interface UsageSummary {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  byModel: Record<string, { calls: number; tokens: number }>;
  byDate: Record<string, { calls: number; tokens: number }>;
}

const RANGES = [
  { label: 'Today', days: 0 },
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: 'All time', days: -1 },
];

export default function TokenUsagePage() {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);

  const fetchUsage = async (days: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (days >= 0) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      params.set('start_date', start.toISOString().split('T')[0]);
      params.set('end_date', end.toISOString().split('T')[0]);
    }

    const res = await fetch(`/api/token-usage?${params}`);
    const data = await res.json();
    setSummary(data.summary);
    setLoading(false);
  };

  const handleClear = async () => {
    if (confirm('Clear all usage data? This cannot be undone.')) {
      await fetch('/api/token-usage?action=clear', { method: 'POST' });
      fetchUsage(range);
    }
  };

  useEffect(() => {
    fetchUsage(range);
  }, []);

  const fmt = (n: number) => n.toLocaleString();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading usage data...</p>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const dateEntries = Object.entries(summary.byDate).sort(([a], [b]) => a.localeCompare(b));
  const maxTokens = Math.max(...dateEntries.map(([, d]) => d.tokens), 1);
  const modelEntries = Object.entries(summary.byModel).sort(([, a], [, b]) => b.tokens - a.tokens);
  const maxModelTokens = Math.max(...modelEntries.map(([, m]) => m.tokens), 1);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <BarChart3 size={16} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Token Usage</h1>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Monitor your DashScope API token consumption</p>
            </div>
            <div className="flex items-center gap-2">
              {RANGES.map(r => (
                <button
                  key={r.label}
                  onClick={() => { setRange(r.days); fetchUsage(r.days); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    range === r.days
                      ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-200 dark:ring-cyan-800'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {r.label}
                </button>
              ))}
              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />
              <button
                onClick={() => fetchUsage(range)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Refresh"
              >
                <RotateCcw size={14} />
              </button>
              {summary.totalCalls > 0 && (
                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  title="Clear data"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {summary.totalCalls === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Zap size={28} className="text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">No usage yet</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">Make some DashScope API calls to see your token consumption tracked here.</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<MessageSquare size={18} />}
                label="API Calls"
                value={fmt(summary.totalCalls)}
                trend={dateEntries.length > 1 ? calcTrend(dateEntries, 'calls') : null}
                accent="cyan"
              />
              <StatCard
                icon={<ArrowUpRight size={18} />}
                label="Input Tokens"
                value={fmt(summary.totalInputTokens)}
                accent="emerald"
              />
              <StatCard
                icon={<ArrowDownRight size={18} />}
                label="Output Tokens"
                value={fmt(summary.totalOutputTokens)}
                accent="blue"
              />
              <StatCard
                icon={<Zap size={18} />}
                label="Total Tokens"
                value={fmt(summary.totalTokens)}
                accent="violet"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Daily Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar size={16} className="text-zinc-400" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Daily Tokens</h2>
                </div>
                <div className="flex items-end gap-1 h-40">
                  {dateEntries.map(([date, data]) => {
                    const pct = (data.tokens / maxTokens) * 100;
                    const d = new Date(date);
                    const dayName = d.toLocaleDateString('en', { weekday: 'narrow' });
                    return (
                      <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                          <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                            {fmt(data.tokens)} tokens · {data.calls} calls
                          </div>
                        </div>
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-cyan-500 to-cyan-400 dark:from-cyan-600 dark:to-cyan-500 transition-all duration-300 hover:from-cyan-600 hover:to-cyan-500"
                          style={{ height: `${Math.max(pct, 4)}%` }}
                        />
                        <span className="text-[10px] text-zinc-400 select-none">{dayName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Model Breakdown */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={16} className="text-zinc-400" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">By Model</h2>
                </div>
                <div className="space-y-4">
                  {modelEntries.map(([model, data]) => {
                    const pct = (data.tokens / maxModelTokens) * 100;
                    const share = ((data.tokens / summary.totalTokens) * 100).toFixed(1);
                    return (
                      <div key={model}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{model}</span>
                          <span className="text-xs text-zinc-400">{share}%</span>
                        </div>
                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-zinc-400">{fmt(data.calls)} calls</span>
                          <span className="text-[10px] text-zinc-400">{fmt(data.tokens)} tokens</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Input/Output Ratio */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Input vs Output Ratio</h2>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Input</span>
                      <span className="text-xs text-zinc-400">{fmt(summary.totalInputTokens)}</span>
                    </div>
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${(summary.totalInputTokens / summary.totalTokens) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Output</span>
                      <span className="text-xs text-zinc-400">{fmt(summary.totalOutputTokens)}</span>
                    </div>
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(summary.totalOutputTokens / summary.totalTokens) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Averages */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-zinc-400" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Averages</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-400 mb-0.5">Tokens / Call</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">{fmt(Math.round(summary.totalTokens / summary.totalCalls))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-0.5">Input / Call</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">{fmt(Math.round(summary.totalInputTokens / summary.totalCalls))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-0.5">Output / Call</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">{fmt(Math.round(summary.totalOutputTokens / summary.totalCalls))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-0.5">Active Days</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">{dateEntries.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, accent }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: { direction: 'up' | 'down'; value: string } | null;
  accent: 'cyan' | 'emerald' | 'blue' | 'violet';
}) {
  const colors = {
    cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', icon: 'text-cyan-600 dark:text-cyan-400', trend: 'text-cyan-600 dark:text-cyan-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', trend: 'text-emerald-600 dark:text-emerald-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400', trend: 'text-blue-600 dark:text-blue-400' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-600 dark:text-violet-400', trend: 'text-violet-600 dark:text-violet-400' },
  };
  const c = colors[accent];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`h-8 w-8 rounded-lg ${c.bg} flex items-center justify-center ${c.icon}`}>{icon}</div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${c.trend}`}>
            {trend.direction === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
      <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
    </div>
  );
}

function calcTrend(entries: [string, { calls: number; tokens: number }[]][], key: 'calls' | 'tokens') {
  const half = Math.ceil(entries.length / 2);
  const first = entries.slice(0, half).reduce((s, [, d]) => s + d[key], 0);
  const second = entries.slice(half).reduce((s, [, d]) => s + d[key], 0);
  if (first === 0) return null;
  const pct = Math.round(((second - first) / first) * 100);
  return { direction: pct >= 0 ? 'up' : 'down', value: `${Math.abs(pct)}%` };
}
