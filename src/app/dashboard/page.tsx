'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import StickyNote from '@/components/ui/StickyNote';
import { Lightbulb, TrendingUp, Filter, Zap, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { cardStagger, cardEntrance, metricEntrance } from '@/lib/animations/variants';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboardData() {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get latest run to identify active brand
      const runsRes = await fetch('/api/runs');
      let targetBrandName = 'Latest';

      if (runsRes.ok) {
        const runs = await runsRes.json();
        if (Array.isArray(runs) && runs.length > 0) {
          targetBrandName = runs[0].brand?.name || 'Latest';
        }
      }

      // 2. Fetch dashboard data for brand
      const res = await fetch(`/api/dashboard/${encodeURIComponent(targetBrandName)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.error || 'Failed to load dashboard metrics');
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Unable to connect to CiteScope metrics server.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const d = data;
  const isEmpty = Boolean(!d || d.emptyState);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin mb-4" />
        <p className="text-body-md text-emerald-900 font-medium">Loading live visibility dashboard...</p>
      </div>
    );
  }

  if (isEmpty || error) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-page py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-display-md mb-4 text-slate-900 font-display">
            No Live Analysis Data Found
          </h1>
          <p className="text-body-lg text-slate-600 max-w-xl mx-auto mb-8">
            {error || 'Run your first live AI visibility analysis to measure how Gemini and AI answer engines perceive and rank your brand.'}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/runs/new"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-800 text-white font-semibold uppercase tracking-wider text-xs shadow-md hover:bg-emerald-900 transition-colors"
            >
              <Zap size={16} className="text-yellow-300 fill-yellow-300" />
              Run Your First Live Analysis
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-page py-16">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4 text-label-caps" style={{ color: 'var(--secondary)' }}>
            <span className="flex items-center gap-1">
              <Filter size={14} /> Brand Filter:
            </span>
            <span className="px-3 py-1 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-900 font-medium">
              Brand: {d.brandName}
            </span>
            <span className="px-3 py-1 rounded-full border bg-slate-50 border-slate-200 text-slate-700">
              Live Database Record
            </span>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-display-lg" style={{ color: 'var(--primary)' }}>
                  AI Visibility Overview
                </h1>
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#059669',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE GEMINI DATA
                </span>
              </div>
              <p className="text-body-lg max-w-2xl" style={{ color: 'var(--on-surface-variant)' }}>
                Empirical visibility metrics calculated from live AI search responses for {d.brandName}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadDashboardData}
                className="p-3 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700"
                title="Refresh Metrics"
              >
                <RefreshCw size={16} />
              </button>
              <Link
                href="/runs/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-800 text-white font-semibold text-xs uppercase tracking-wider shadow-sm hover:bg-emerald-900 transition-colors"
              >
                <Zap size={14} className="text-yellow-300 fill-yellow-300" />
                Run New Analysis
              </Link>
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16"
        >
          {/* Top Left: Visibility Score */}
          <motion.div
            variants={cardEntrance}
            className="md:col-span-8 p-8 rounded-xl border relative overflow-hidden bento-card"
            style={{
              backgroundColor: 'var(--secondary-container)',
              borderColor: 'var(--outline-variant)',
              color: 'var(--on-secondary-fixed)',
            }}
          >
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2
                  className="text-headline-sm mb-1"
                  style={{ color: 'var(--on-secondary-fixed-variant)' }}
                >
                  AI Visibility Score
                </h2>
                <p className="text-body-md" style={{ color: 'var(--on-secondary-container)' }}>
                  Percentage of analyzed AI responses mentioning {d.brandName}.
                </p>
              </div>
              <div className="text-right">
                <motion.div
                  variants={metricEntrance}
                  className="text-metric-num"
                  style={{ color: 'var(--on-secondary-fixed)' }}
                >
                  {d.visibilityScore ?? 0}%
                </motion.div>
                <div
                  className="text-label-caps flex items-center justify-end gap-1 mt-1"
                  style={{ color: 'var(--primary-container)' }}
                >
                  <TrendingUp size={14} /> Deterministic DB Metric
                </div>
              </div>
            </div>

            {/* Abstract Trend Graphic */}
            <div className="h-32 w-full relative">
              <svg
                className="absolute bottom-0 w-full h-full opacity-40"
                preserveAspectRatio="none"
                viewBox="0 0 100 30"
              >
                <path
                  d="M0,30 L0,20 C10,22 20,15 30,18 C40,21 50,10 60,15 C70,20 80,5 90,8 L100,5 L100,30 Z"
                  fill="#7da796"
                />
              </svg>
              <svg
                className="absolute bottom-0 w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 30"
              >
                <path
                  d="M0,30 L0,25 C15,25 25,18 35,22 C45,26 55,12 65,18 C75,24 85,8 95,10 L100,8 L100,30 Z"
                  fill="#123c2f"
                />
              </svg>
            </div>
          </motion.div>

          {/* Top Right: Share of Voice */}
          <motion.div
            variants={cardEntrance}
            className="md:col-span-4 p-8 rounded-xl border bento-card flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--blush)',
              borderColor: '#ffb4ab',
              color: '#93000a',
            }}
          >
            <div>
              <h2 className="text-headline-sm mb-1">Share of Mentions</h2>
              <p className="text-body-md opacity-80 mb-6">Versus primary competitors</p>
            </div>
            <div>
              <div className="text-metric-num mb-4">{d.shareOfMentions ?? 0}%</div>
              <div className="space-y-3">
                {(d.competitorShares || []).map((c: any, i: number) => (
                  <div key={c.name} className="bar-chart-row">
                    <span
                      className="w-[120px] text-sm truncate"
                      style={{
                        fontFamily: "'Hanken Grotesk'",
                        color: '#93000a',
                        fontWeight: c.name === d.brandName ? 700 : 400,
                      }}
                    >
                      {c.name} {c.name === d.brandName ? '(You)' : ''}
                    </span>
                    <div className="bar-track" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                      <div
                        className="bar-fill"
                        style={{
                          width: `${c.share}%`,
                          backgroundColor: '#93000a',
                          opacity: c.name === d.brandName ? 1 : 0.5,
                        }}
                      />
                    </div>
                    <span
                      className="w-10 text-right text-sm font-bold"
                      style={{
                        fontFamily: "'Bricolage Grotesque'",
                        color: '#93000a',
                      }}
                    >
                      {c.share}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Lower Left: Sticky Note */}
          <motion.div variants={cardEntrance} className="md:col-span-4">
            <StickyNote
              color="mustard"
              rotation="pos"
              label="AI Visibility Insight"
              labelIcon={<Lightbulb size={18} />}
              className="h-full flex flex-col"
            >
              <p className="text-body-md leading-relaxed flex-grow" style={{ color: '#271900' }}>
                {d.insights?.[0]?.observation || `${d.brandName} has an AI visibility score of ${d.visibilityScore}%. Run additional prompts to uncover deeper competitive gap insights.`}
              </p>
              {d.insights?.[0]?.id && (
                <div className="mt-4 pt-4 border-t border-amber-300/60">
                  <Link href={`/insights/${d.insights[0].id}`} className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1 hover:underline">
                    View Strategic Brief <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </StickyNote>
          </motion.div>

          {/* Lower Right: Engine Detail */}
          <motion.div
            variants={cardEntrance}
            className="md:col-span-8 bento-card p-8"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <h2 className="text-headline-sm mb-6" style={{ color: 'var(--primary)' }}>
              Per-Engine Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(d.engineBreakdown || []).map((engine: any) => (
                <div key={engine.engineName} className="p-4 rounded-xl border border-slate-100 bg-white">
                  <div
                    className="flex items-center gap-2 mb-4 pb-3 border-b"
                    style={{ borderColor: 'var(--surface-variant)' }}
                  >
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: engine.engineColor || '#8E75B2' }}
                    >
                      {engine.abbreviation || 'GEM'}
                    </div>
                    <h3 className="font-semibold text-body-md" style={{ color: 'var(--on-surface)' }}>
                      {engine.engineName}
                    </h3>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Mention Frequency</span>
                      <span className="font-bold text-slate-900">{engine.mentionFrequency || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Avg. Rank Position</span>
                      <span className="font-bold text-slate-900">{engine.avgPosition ? `#${engine.avgPosition}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
