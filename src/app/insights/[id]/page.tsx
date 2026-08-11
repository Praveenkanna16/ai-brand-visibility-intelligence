'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import StickyNote from '@/components/ui/StickyNote';
import { ArrowLeft, Lightbulb, ArrowRight, CheckCircle2, XCircle, Loader2, AlertTriangle, Zap } from 'lucide-react';
import { cardStagger, cardEntrance } from '@/lib/animations/variants';

export default function VisibilityGapPage() {
  const params = useParams();
  const id = params?.id as string;

  const [insight, setInsight] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadInsight() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/insights/${id}`);
        if (res.ok) {
          const data = await res.json();
          setInsight(data);
        } else {
          setError('Insight not found in the database.');
        }
      } catch (err) {
        console.error('Error loading insight:', err);
        setError('Unable to connect to CiteScope server.');
      } finally {
        setIsLoading(false);
      }
    }
    loadInsight();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 size={36} className="animate-spin text-emerald-700 mb-4" />
        <p className="text-body-md text-emerald-900 font-medium">Loading insight details...</p>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-page py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-800 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-display-md mb-4 text-slate-900 font-display">
            Insight Not Found
          </h1>
          <p className="text-body-lg text-slate-600 max-w-xl mx-auto mb-8">
            {error || 'The requested visibility gap insight could not be found in the database.'}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/runs/new"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-800 text-white font-semibold uppercase tracking-wider text-xs shadow-md hover:bg-emerald-900 transition-colors"
            >
              <Zap size={16} className="text-yellow-300 fill-yellow-300" />
              Run Live Analysis
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const ins = insight;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-page py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-label-caps hover:opacity-70 transition-opacity"
            style={{ color: 'var(--secondary)' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
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
            "{ins.promptText}"
          </h1>
          <p className="text-body-lg max-w-2xl" style={{ color: 'var(--secondary)' }}>
            Comparative diagnostic mapping why AI engine recommendations favored competitors over {ins.brandName || 'your brand'}.
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
                  {ins.brandName || 'Target Brand'}
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
                  {ins.competitorName}
                </h3>
              </div>
              <span
                className="flex items-center gap-1 px-3 py-1 rounded-full text-label-caps"
                style={{
                  backgroundColor: 'rgba(192, 236, 217, 0.4)',
                  color: 'var(--on-primary-fixed-variant)',
                }}
              >
                <CheckCircle2 size={14} /> MENTIONED
              </span>
            </div>
            <p className="text-body-md leading-relaxed" style={{ color: 'var(--secondary)' }}>
              Primary recommendation cited by AI answer engine for this query context.
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
                  {ins.whyCompetitorWon}
                </p>
              </div>

              <hr style={{ borderColor: 'var(--outline-variant)' }} />

              <div>
                <h3 className="text-headline-sm mb-3" style={{ color: 'var(--primary)' }}>
                  Evidence & Attribution Analysis
                </h3>
                <p className="text-body-md leading-relaxed" style={{ color: 'var(--secondary)' }}>
                  {ins.evidenceText}
                </p>
              </div>

              <hr style={{ borderColor: 'var(--outline-variant)' }} />

              <div>
                <h3 className="text-headline-sm mb-3" style={{ color: 'var(--primary)' }}>
                  Core Hypothesis
                </h3>
                <p className="text-body-md leading-relaxed" style={{ color: 'var(--secondary)' }}>
                  {ins.hypothesis}
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
                {ins.recommendedAction}
              </p>
              <Link
                href={`/insights/${ins.id}/brief`}
                className="w-full inline-flex justify-center items-center gap-2 px-6 py-4 rounded-full text-label-caps font-bold transition-opacity hover:opacity-90 shadow-sm"
                style={{
                  backgroundColor: 'var(--primary-container)',
                  color: 'var(--on-primary)',
                }}
              >
                VIEW CONTENT BRIEF
                <ArrowRight size={16} />
              </Link>
            </StickyNote>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
