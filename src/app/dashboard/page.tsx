'use client';

import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import BentoCard from '@/components/ui/BentoCard';
import StickyNote from '@/components/ui/StickyNote';
import ScrollReveal from '@/components/layout/ScrollReveal';
import { demoDashboard } from '@/lib/demo/data';
import { Lightbulb, TrendingUp, Filter } from 'lucide-react';
import { cardStagger, cardEntrance, metricEntrance } from '@/lib/animations/variants';

export default function DashboardPage() {
  const d = demoDashboard;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-page py-16">
        {/* ─── Header ─── */}
        <header className="mb-12">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-4 text-label-caps" style={{ color: 'var(--secondary)' }}>
            <span className="flex items-center gap-1">
              <Filter size={14} /> Filters:
            </span>
            {['Brand: Pixis', 'Engine: All', `Period: ${d.period}`].map((f) => (
              <span
                key={f}
                className="px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: 'var(--surface-container)',
                  borderColor: 'var(--outline-variant)',
                }}
              >
                {f}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-display-lg" style={{ color: 'var(--primary)' }}>
                  AI Visibility Overview
                </h1>
                <span
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-label-caps border"
                  style={{
                    backgroundColor: 'rgba(192, 236, 217, 0.2)',
                    color: 'var(--primary-container)',
                    borderColor: 'var(--primary-fixed)',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--primary-container)' }}
                  />
                  Live
                </span>
              </div>
              <p className="text-body-lg max-w-2xl" style={{ color: 'var(--on-surface-variant)' }}>
                A comprehensive analysis of how leading AI search engines perceive, recommend, and synthesize
                your brand across critical industry queries.
              </p>
            </div>
          </div>
        </header>

        {/* ─── Bento Grid ─── */}
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
                  Aggregate prominence across all monitored LLMs.
                </p>
              </div>
              <div className="text-right">
                <motion.div
                  variants={metricEntrance}
                  className="text-metric-num"
                  style={{ color: 'var(--on-secondary-fixed)' }}
                >
                  {d.visibilityScore}%
                </motion.div>
                <div
                  className="text-label-caps flex items-center justify-end gap-1 mt-1"
                  style={{ color: 'var(--primary-container)' }}
                >
                  <TrendingUp size={14} /> +{d.trendChange}% ({d.period})
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
              <h2 className="text-headline-sm mb-1">Share of Voice</h2>
              <p className="text-body-md opacity-80 mb-6">Versus primary competitors</p>
            </div>
            <div>
              <div className="text-metric-num mb-4">{d.shareOfVoice[0].share}%</div>
              <div className="space-y-3">
                {d.shareOfVoice.filter(c => c.name !== 'Others').map((c, i) => (
                  <div key={c.name} className="bar-chart-row">
                    <span
                      className="w-[120px] text-sm"
                      style={{
                        fontFamily: "'Hanken Grotesk'",
                        color: '#93000a',
                        fontWeight: i === 0 ? 700 : 400,
                      }}
                    >
                      {c.name}
                    </span>
                    <div className="bar-track" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                      <div
                        className="bar-fill"
                        style={{
                          width: `${c.share}%`,
                          backgroundColor: '#93000a',
                          opacity: i === 0 ? 1 : i === 1 ? 0.5 : 0.3,
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
          <motion.div variants={cardEntrance} className="md:col-span-3">
            <StickyNote
              color="mustard"
              rotation="pos"
              label="AI Visibility Insight"
              labelIcon={<Lightbulb size={18} />}
              className="h-full flex flex-col"
            >
              <p className="text-body-md leading-relaxed flex-grow" style={{ color: '#271900' }}>
                {d.aiInsight}
              </p>
              <div className="mt-auto pt-6 text-label-caps opacity-60">{d.insightDate}</div>
            </StickyNote>
          </motion.div>

          {/* Lower Right: Engines Detail */}
          <motion.div
            variants={cardEntrance}
            className="md:col-span-9 bento-card p-8"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <h2 className="text-headline-sm mb-6" style={{ color: 'var(--primary)' }}>
              Visibility Across AI Engines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {d.engineBreakdown.map((engine) => (
                <div key={engine.engineName}>
                  <div
                    className="flex items-center gap-2 mb-4 pb-4 border-b"
                    style={{ borderColor: 'var(--surface-variant)' }}
                  >
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: engine.engineColor }}
                    >
                      {engine.abbreviation}
                    </div>
                    <h3 className="text-headline-sm" style={{ color: 'var(--on-surface)' }}>
                      {engine.engineName}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                        Mention Frequency
                      </span>
                      <span className="font-bold" style={{ color: 'var(--primary)' }}>
                        {engine.mentionFrequency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                        Avg. Position
                      </span>
                      <span className="font-bold" style={{ color: 'var(--primary)' }}>
                        {engine.avgPosition}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                        Sentiment
                      </span>
                      <span style={{ color: engine.sentiment === 'positive' ? '#10a37f' : 'var(--primary)' }}>
                        {engine.sentiment === 'positive' ? '😊' : '😐'}
                      </span>
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
