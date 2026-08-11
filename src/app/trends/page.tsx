'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import { demoTrends } from '@/lib/demo/data';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, TrendingUp, BarChart2 } from 'lucide-react';
import { fadeInUp, cardStagger, cardEntrance } from '@/lib/animations/variants';

export default function TrendsPage() {
  const [period, setPeriod] = useState('30D');

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
                Historical Trends
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="text-body-lg max-w-2xl"
                style={{ color: 'var(--secondary)' }}
              >
                Track changes in AI Visibility Score, Share of Voice, and average citation rankings over time.
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
                  62%
                </span>
                <span className="text-label-caps block text-emerald-600 font-bold">+8.4% ({period})</span>
              </div>
            </div>

            {/* Recharts Line Chart */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demoTrends}>
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
                    name="Share of Voice"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={cardEntrance} className="bento-card p-6">
              <span className="text-label-caps block mb-2" style={{ color: 'var(--secondary)' }}>
                Average Position
              </span>
              <span className="text-metric-num" style={{ color: 'var(--primary)' }}>
                1.8
              </span>
              <span className="text-body-md block mt-2 text-emerald-700">↗ Improved from 3.2</span>
            </motion.div>

            <motion.div variants={cardEntrance} className="bento-card p-6">
              <span className="text-label-caps block mb-2" style={{ color: 'var(--secondary)' }}>
                Total Brand Mentions
              </span>
              <span className="text-metric-num" style={{ color: 'var(--primary)' }}>
                40
              </span>
              <span className="text-body-md block mt-2" style={{ color: 'var(--secondary)' }}>
                Across 20 category prompts
              </span>
            </motion.div>

            <motion.div variants={cardEntrance} className="bento-card p-6">
              <span className="text-label-caps block mb-2" style={{ color: 'var(--secondary)' }}>
                Share of Voice Trend
              </span>
              <span className="text-metric-num" style={{ color: 'var(--primary)' }}>
                31%
              </span>
              <span className="text-body-md block mt-2 text-emerald-700">↗ +9% increase over 90D</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
