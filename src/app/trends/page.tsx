'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Zap, AlertCircle } from 'lucide-react';
import { fadeInUp, cardStagger, cardEntrance } from '@/lib/animations/variants';

export default function TrendsPage() {
  const [period, setPeriod] = useState('ALL');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrendsData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/trends');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError('Failed to load historical trend data.');
        }
      } catch (err) {
        console.error('Error loading trends:', err);
        setError('Unable to connect to CiteScope server.');
      } finally {
        setIsLoading(false);
      }
    }

    loadTrendsData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin mb-4" />
        <p className="text-body-md text-emerald-900 font-medium">Loading historical visibility trajectory...</p>
      </div>
    );
  }

  const trends = data?.trends || [];

  if (error || !data || data.emptyState || trends.length < 2) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-page py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-display-md mb-4 text-slate-900 font-display">
            Insufficient Run History for Trends
          </h1>
          <p className="text-body-lg text-slate-600 max-w-xl mx-auto mb-8">
            Historical visibility trends require at least 2 completed analysis runs over time. Run another live analysis to track changes in visibility score and share of voice.
          </p>
          <Link
            href="/runs/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-800 text-white font-semibold uppercase tracking-wider text-xs shadow-md hover:bg-emerald-900 transition-colors"
          >
            <Zap size={16} className="text-yellow-300 fill-yellow-300" />
            Run New Analysis
          </Link>
        </div>
      </PageTransition>
    );
  }

  const latest = trends[trends.length - 1];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-page py-16">
        {/* Header */}
        <header className="mb-12">
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <motion.h1
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="text-display-lg mb-4"
                style={{ color: 'var(--primary)' }}
              >
                Historical Visibility Trends
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="text-body-lg max-w-2xl"
                style={{ color: 'var(--secondary)' }}
              >
                Track changes in AI Visibility Score, Share of Mentions, and average citation rankings across past analysis runs stored in PostgreSQL.
              </motion.p>
            </div>

            {/* Time Filter Buttons */}
            <div className="flex gap-2 text-label-caps">
              {['7D', '30D', '90D', 'ALL'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-full border transition-all ${
                    period === p ? 'font-bold' : ''
                  }`}
                  style={{
                    backgroundColor: period === p ? 'var(--primary-container)' : 'var(--surface-container)',
                    color: period === p ? 'var(--on-primary)' : 'var(--secondary)',
                    borderColor: period === p ? 'var(--primary-container)' : 'var(--outline-variant)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Chart Card */}
        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={cardEntrance} className="bento-card p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-headline-sm" style={{ color: 'var(--primary)' }}>
                  AI Visibility Score Trajectory
                </h2>
                <p className="text-body-md" style={{ color: 'var(--secondary)' }}>
                  Overall brand detection rate across monitored prompts
                </p>
              </div>
              <div className="text-right">
                <span className="text-metric-num" style={{ color: 'var(--primary)' }}>
                  {latest?.visibilityScore ?? 0}%
                </span>
                <span className="text-label-caps block text-emerald-600 font-bold">Latest Analysis Score</span>
              </div>
            </div>

            {/* Recharts Line Chart */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e2dd" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#717974"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e2dd' }}
                  />
                  <YAxis
                    stroke="#717974"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fcf9f3',
                      borderColor: '#c0c8c3',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visibilityScore"
                    stroke="#123c2f"
                    strokeWidth={3}
                    dot={{ fill: '#123c2f', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Visibility Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="shareOfVoice"
                    stroke="#f8bd4b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: '#f8bd4b', r: 3 }}
                    name="Share of Mentions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={cardEntrance} className="bento-card p-6">
              <span className="text-label-caps block mb-2" style={{ color: 'var(--secondary)' }}>
                Latest Average Position
              </span>
              <span className="text-metric-num" style={{ color: 'var(--primary)' }}>
                {latest?.avgPosition ? `#${latest.avgPosition}` : 'N/A'}
              </span>
              <span className="text-body-md block mt-2 text-emerald-700">Rank when cited by Gemini</span>
            </motion.div>

            <motion.div variants={cardEntrance} className="bento-card p-6">
              <span className="text-label-caps block mb-2" style={{ color: 'var(--secondary)' }}>
                Total Analyzed Runs
              </span>
              <span className="text-metric-num" style={{ color: 'var(--primary)' }}>
                {trends.length}
              </span>
              <span className="text-body-md block mt-2" style={{ color: 'var(--secondary)' }}>
                Persisted in PostgreSQL database
              </span>
            </motion.div>

            <motion.div variants={cardEntrance} className="bento-card p-6">
              <span className="text-label-caps block mb-2" style={{ color: 'var(--secondary)' }}>
                Latest Share of Mentions
              </span>
              <span className="text-metric-num" style={{ color: 'var(--primary)' }}>
                {latest?.shareOfVoice ?? 0}%
              </span>
              <span className="text-body-md block mt-2 text-emerald-700">Versus competitor mentions</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
