'use client';

import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import StickyNote from '@/components/ui/StickyNote';
import { demoCompetitorAnalysis } from '@/lib/demo/data';
import { Users, TrendingUp, Award, Zap, Lightbulb } from 'lucide-react';
import { fadeInUp, cardStagger, cardEntrance } from '@/lib/animations/variants';

export default function CompetitorsPage() {
  const ca = demoCompetitorAnalysis;

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
            Competitive Visibility
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-body-lg max-w-2xl"
            style={{ color: 'var(--secondary)' }}
          >
            Head-to-head share of voice, citation frequency, and claims breakdown across all monitored competitor entities.
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
              Share of Voice Comparison
            </h2>
            <p className="text-body-md mb-8" style={{ color: 'var(--secondary)' }}>
              Distribution of citations across category prompts.
            </p>
            <div className="space-y-6">
              {ca.shareOfVoice.map((comp, i) => (
                <div key={comp.name} className="space-y-2">
                  <div className="flex justify-between text-body-md font-medium">
                    <span style={{ color: i === 0 ? 'var(--primary)' : 'var(--on-surface)' }}>
                      {comp.name} {i === 0 && '(You)'}
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
                        backgroundColor: i === 0 ? 'var(--primary-container)' : i === 1 ? '#5e4200' : 'var(--outline)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Right: Average Position Rankings */}
          <motion.div variants={cardEntrance} className="md:col-span-6 bento-card p-8">
            <h2 className="text-headline-sm mb-2" style={{ color: 'var(--primary)' }}>
              Average Citation Rank
            </h2>
            <p className="text-body-md mb-8" style={{ color: 'var(--secondary)' }}>
              Mean position rank when entity is recommended by LLMs.
            </p>
            <div className="space-y-4">
              {ca.avgPositions.map((pos, i) => (
                <div
                  key={pos.name}
                  className="flex items-center justify-between p-4 rounded-xl border"
                  style={{
                    backgroundColor: i === 0 ? 'rgba(192, 236, 217, 0.3)' : 'var(--surface-container-low)',
                    borderColor: 'var(--outline-variant)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold font-display text-sm"
                      style={{
                        backgroundColor: i === 0 ? 'var(--primary-container)' : 'var(--surface-container-high)',
                        color: i === 0 ? 'var(--on-primary)' : 'var(--secondary)',
                      }}
                    >
                      #{i + 1}
                    </span>
                    <span className="font-body font-medium text-body-md" style={{ color: 'var(--primary)' }}>
                      {pos.name}
                    </span>
                  </div>
                  <span className="font-display font-bold text-headline-sm" style={{ color: 'var(--primary)' }}>
                    {pos.position}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ─── Frequently Cited Claims & Sticky Note ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Claims List */}
          <div className="md:col-span-8 bento-card p-8">
            <h2 className="text-headline-sm mb-6 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <Zap size={20} style={{ color: 'var(--tertiary-container)' }} />
              Most Frequently Cited Competitor Claims
            </h2>
            <div className="space-y-4">
              {ca.frequentClaims.map((claim, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl border space-y-2"
                  style={{
                    backgroundColor: 'var(--surface-container-low)',
                    borderColor: 'var(--outline-variant)',
                  }}
                >
                  <div className="flex justify-between items-center text-label-caps">
                    <span className="font-bold" style={{ color: 'var(--primary-container)' }}>
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
                {ca.competitiveSignal}
              </p>
            </StickyNote>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
