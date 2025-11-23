'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

type LeaderboardItem = {
  rank: number;
  userId: string;
  name: string;
  avgProgress: number;
};

export default function LeaderboardPage() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/api/admin/leaderboard?limit=50', { signal: controller.signal });
      if (res?.data?.success) {
        setItems(res.data.data || []);
      } else {
        setError(res?.data?.message || 'Unexpected response from server');
      }
    } catch (err: any) {
      const isCanceled = err?.name === 'AbortError' || err?.code === 'ERR_CANCELED' || err?.message === 'canceled';
      if (!isCanceled) {
        setError(err?.response?.data?.message || err?.message || 'Network error');
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Leaderboard</h1>
          <p className="text-sm text-slate-300">Top students by average progress</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="rounded-md bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
            onClick={fetchLeaderboard}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-600 bg-red-900/30 p-4">
          <div className="text-sm text-red-300">{error}</div>
          <div className="mt-2">
            <button
              onClick={fetchLeaderboard}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        {loading && !items.length ? (
          <div className="text-sm text-slate-300">Loading leaderboard…</div>
        ) : (
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-sm text-slate-400">No leaderboard data yet.</div>
            ) : (
              items.map((it) => (
                <div
                  key={it.userId}
                  className="flex items-center gap-4 rounded-md border border-slate-800 bg-slate-900/50 p-4"
                >
                  <div className="w-10 text-center text-lg font-bold text-white">{it.rank}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-white">{it.name}</div>
                      <div className="text-sm font-mono text-slate-300">{Math.round(it.avgProgress)}%</div>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-emerald-400"
                        style={{ width: `${Math.max(0, Math.min(100, it.avgProgress))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
