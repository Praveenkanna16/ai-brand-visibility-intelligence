'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import StickyNote from '@/components/ui/StickyNote';
import { demoInsights } from '@/lib/demo/data';
import { ArrowLeft, Lightbulb, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { fadeInUp, cardStagger, cardEntrance } from '@/lib/animations/variants';

export default function VisibilityGapPage({ params }: { params: { id: string } }) {
  const insight = demoInsights.find((i) => i.id === params.id) || demoInsights[0];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-page py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/prompts"
            className="inline-flex items-center gap-2 text-label-caps hover:opacity-70 transition-opacity"
            style={{ color: 'var(--secondary)' }}
          >
            <ArrowLeft size={14} /> Back to Prompts Matrix
          </Link>
        </div>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="px-3 py-1 rounded-full text-label-caps border"
              style={{
                backgroundColor: 'var(--error-container)',
                color: 'var(--on-error-container)',
                borderColor: '#ffb4ab',
              }}
            >
              Visibility Gap Identified
            </span>
          </div>
          <h1 className="text-display-lg mb-4" style={{ color: 'var(--primary)' }}>
            "{insight.promptText}"
          </h1>
          <p className="text-body-lg max-w-2xl" style={{ color: 'var(--secondary)' }}>
            Comparative diagnostic mapping why AI engine recommendations favored competitors over Pixis.
          </p>
        </header>

        {/* Brand vs Competitor Split Cards */}
        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12"
        >
          {/* Target Brand Card */}
          <motion.div
            variants={cardEntrance}
            className="md:col-span-6 bento-card p-8 border border-red-200"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-label-caps" style={{ color: 'var(--secondary)' }}>
                  Target Brand
                </span>
                <h3 className="text-headline-sm" style={{ color: 'var(--primary)' }}>
                  Pixis
                </h3>
              </div>
              <span
                className="flex items-center gap-1 px-3 py-1 rounded-full text-label-caps"
                style={{
                  backgroundColor: 'var(--error-container)',
                  color: 'var(--on-error-container)',
                }}
              >
                <XCircle size={14} /> NOT MENTIONED
              </span>
            </div>
            <p className="text-body-md leading-relaxed" style={{ color: 'var(--secondary)' }}>
              No presence detected across primary response citations for this specific prompt theme.
            </p>
          </motion.div>

          {/* Winning Competitor Card */}
          <motion.div
            variants={cardEntrance}
            className="md:col-span-6 bento-card p-8 border border-emerald-200"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-label-caps" style={{ color: 'var(--secondary)' }}>
                  Winning Entity
                </span>
                <h3 className="text-headline-sm" style={{ color: 'var(--primary)' }}>
                  {insight.competitorName}
                </h3>
              </div>
              <span
                className="flex items-center gap-1 px-3 py-1 rounded-full text-label-caps"
                style={{
                  backgroundColor: 'rgba(192, 236, 217, 0.4)',
                  color: 'var(--on-primary-fixed-variant)',
                }}
              >
                <CheckCircle2 size={14} /> MENTIONED #{insight.competitorPosition || 1}
              </span>
            </div>
            <p className="text-body-md leading-relaxed" style={{ color: 'var(--secondary)' }}>
              Cited in {insight.competitorCiteRate || 87}% of engine runs for this query domain.
            </p>
          </motion.div>
        </motion.div>

        {/* Detailed Analysis & Sticky Note */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Analysis Left Column */}
          <div className="md:col-span-7 space-y-8">
            <div className="bento-card p-8 space-y-6">
              <div>
                <h3 className="text-headline-sm mb-3" style={{ color: 'var(--primary)' }}>
                  Why did the competitor win?
                </h3>
                <p className="text-body-lg leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                  {insight.whyCompetitorWon}
                </p>
              </div>

              <hr style={{ borderColor: 'var(--outline-variant)' }} />

              <div>
                <h3 className="text-headline-sm mb-3" style={{ color: 'var(--primary)' }}>
                  Evidence & Attribution Analysis
                </h3>
                <p className="text-body-md leading-relaxed" style={{ color: 'var(--secondary)' }}>
                  {insight.evidenceText}
                </p>
              </div>

              <hr style={{ borderColor: 'var(--outline-variant)' }} />

              <div>
                <h3 className="text-headline-sm mb-3" style={{ color: 'var(--primary)' }}>
                  Core Hypothesis
                </h3>
                <p className="text-body-md leading-relaxed" style={{ color: 'var(--secondary)' }}>
                  {insight.hypothesis}
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Note Right Column */}
          <div className="md:col-span-5 space-y-6">
            <StickyNote
              color="mustard"
              rotation="pos"
              label="Recommended Action"
              labelIcon={<Lightbulb size={18} />}
              className="h-full flex flex-col justify-between"
            >
              <p className="text-body-lg leading-relaxed mb-8" style={{ color: '#271900' }}>
                {insight.recommendedAction}
              </p>
              <Link
                href={`/insights/${insight.id}/brief`}
                className="w-full inline-flex justify-center items-center gap-2 px-6 py-4 rounded-full text-label-caps font-bold transition-opacity hover:opacity-90 shadow-sm"
                style={{
                  backgroundColor: 'var(--primary-container)',
                  color: 'var(--on-primary)',
                }}
              >
                CREATE CONTENT BRIEF
                <ArrowRight size={16} />
              </Link>
            </StickyNote>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
