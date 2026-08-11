'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import StickyNote from '@/components/ui/StickyNote';
import { Lightbulb, Zap, AlertCircle } from 'lucide-react';
import { fadeInUp, cardStagger, cardEntrance } from '@/lib/animations/variants';

export default function CompetitorsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompetitorData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/competitors');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError('Failed to load competitive analysis data.');
        }
      } catch (err) {
        console.error('Error loading competitor data:', err);
        setError('Unable to connect to CiteScope server.');
      } finally {
        setIsLoading(false);
      }
    }

    loadCompetitorData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin mb-4" />
        <p className="text-body-md text-emerald-900 font-medium">Loading competitive intelligence...</p>
      </div>
    );
  }

  if (error || !data || data.emptyState) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-page py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-display-md mb-4 text-slate-900 font-display">
            No Competitor Intelligence Found
          </h1>
          <p className="text-body-lg text-slate-600 max-w-xl mx-auto mb-8">
            Run a live analysis to compare your target brand against competitors across AI search responses.
          </p>
          <Link
            href="/runs/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-800 text-white font-semibold uppercase tracking-wider text-xs shadow-md hover:bg-emerald-900 transition-colors"
          >
            <Zap size={16} className="text-yellow-300 fill-yellow-300" />
            Run Live Analysis
          </Link>
        </div>
      </PageTransition>
    );
  }

  const brandName = data.brandName || 'Target Brand';

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-page py-16">
        {/* Header */}
        <header className="mb-12">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-display-lg mb-4"
            style={{ color: 'var(--primary)' }}
          >
            Competitive Visibility for {brandName}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-body-lg max-w-2xl"
            style={{ color: 'var(--secondary)' }}
          >
            Head-to-head share of mentions, citation rank positions, and extracted claims across analyzed prompts.
          </motion.p>
        </header>

        {/* ─── Grid ─── */}
        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12"
        >
          {/* Top Left: Share of Voice comparison */}
          <motion.div variants={cardEntrance} className="md:col-span-6 bento-card p-8">
            <h2 className="text-headline-sm mb-2" style={{ color: 'var(--primary)' }}>
              Share of Mentions
            </h2>
            <p className="text-body-md mb-8" style={{ color: 'var(--secondary)' }}>
              Percentage of total citations won across category prompts.
            </p>
            <div className="space-y-6">
              {(data.shareOfVoice || []).map((comp: any, i: number) => {
                const isTarget = comp.name === brandName;
                return (
                  <div key={comp.name} className="space-y-2">
                    <div className="flex justify-between text-body-md font-medium">
                      <span style={{ color: isTarget ? 'var(--primary)' : 'var(--on-surface)' }}>
                        {comp.name} {isTarget ? '(Target Brand)' : ''}
                      </span>
                      <span className="font-bold font-display" style={{ color: 'var(--primary)' }}>
                        {comp.share}%
                      </span>
                    </div>
                    <div
                      className="h-3 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--surface-container)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${comp.share}%`,
                          backgroundColor: isTarget ? 'var(--primary-container)' : i === 1 ? '#5e4200' : 'var(--outline)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Top Right: Average Position Rankings */}
          <motion.div variants={cardEntrance} className="md:col-span-6 bento-card p-8">
            <h2 className="text-headline-sm mb-2" style={{ color: 'var(--primary)' }}>
              Average Citation Rank
            </h2>
            <p className="text-body-md mb-8" style={{ color: 'var(--secondary)' }}>
              Mean position rank when entity is recommended by Gemini.
            </p>
            <div className="space-y-4">
              {(data.avgPositions || []).map((pos: any, i: number) => {
                const isTarget = pos.name === brandName;
                return (
                  <div
                    key={pos.name}
                    className="flex items-center justify-between p-4 rounded-xl border"
                    style={{
                      backgroundColor: isTarget ? 'rgba(192, 236, 217, 0.3)' : 'var(--surface-container-low)',
                      borderColor: 'var(--outline-variant)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold font-display text-sm"
                        style={{
                          backgroundColor: isTarget ? 'var(--primary-container)' : 'var(--surface-container-high)',
                          color: isTarget ? 'var(--on-primary)' : 'var(--secondary)',
                        }}
                      >
                        #{i + 1}
                      </span>
                      <span className="font-body font-medium text-body-md" style={{ color: 'var(--primary)' }}>
                        {pos.name} {isTarget ? '(Target Brand)' : ''}
                      </span>
                    </div>
                    <span className="font-display font-bold text-headline-sm" style={{ color: 'var(--primary)' }}>
                      #{pos.position}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* ─── Frequently Cited Claims & Sticky Note ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Claims List */}
          <div className="md:col-span-8 bento-card p-8">
            <h2 className="text-headline-sm mb-6 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <Zap size={20} style={{ color: 'var(--tertiary-container)' }} />
              Extracted Competitor Claims & Features
            </h2>
            {data.frequentClaims && data.frequentClaims.length > 0 ? (
              <div className="space-y-4">
                {data.frequentClaims.map((claim: any, i: number) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl border space-y-2"
                    style={{
                      backgroundColor: 'var(--surface-container-low)',
                      borderColor: 'var(--outline-variant)',
                    }}
                  >
                    <div className="flex justify-between items-center text-label-caps">
                      <span className="font-bold text-emerald-900">
                        {claim.competitor}
                      </span>
                      <span style={{ color: 'var(--secondary)' }}>{claim.frequency}</span>
                    </div>
                    <p className="text-body-md font-medium italic" style={{ color: 'var(--primary)' }}>
                      {claim.claim}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-md text-slate-600 italic">No specific claims extracted for competitors yet.</p>
            )}
          </div>

          {/* Sticky Note */}
          <div className="md:col-span-4">
            <StickyNote
              color="mustard"
              rotation="pos"
              label="Competitive Signal"
              labelIcon={<Lightbulb size={18} />}
              className="h-full flex flex-col justify-between"
            >
              <p className="text-body-md leading-relaxed" style={{ color: '#271900' }}>
                {data.competitiveSignal || 'Competitive analysis complete.'}
              </p>
            </StickyNote>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
