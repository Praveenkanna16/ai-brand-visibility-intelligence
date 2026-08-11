'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import StickyNote from '@/components/ui/StickyNote';
import { demoRunProgress, demoCompletedRun } from '@/lib/demo/data';
import { CheckCircle2, Loader2, Circle, Lightbulb, ArrowRight } from 'lucide-react';
import { progressStep, fadeInUp, buttonHover, buttonTap, cardStagger, cardEntrance } from '@/lib/animations/variants';

export default function RunProgressPage() {
  const [progress, setProgress] = useState(demoRunProgress);
  const [isCompleted, setIsCompleted] = useState(false);

  // Simulate progress in demo mode
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev.progressCurrent >= prev.progressTotal) {
          clearInterval(interval);
          setIsCompleted(true);
          return {
            ...prev,
            status: 'COMPLETED',
            currentStep: 'Generating recommendations',
            currentStepDetail: 'Analysis complete.',
            steps: prev.steps.map((s) => ({ ...s, status: 'completed' as const })),
            engines: prev.engines.map((e) => ({ ...e, status: 'completed' as const })),
          };
        }

        const newCurrent = prev.progressCurrent + 1;
        const stepIdx = Math.min(Math.floor((newCurrent / prev.progressTotal) * prev.steps.length), prev.steps.length - 1);

        return {
          ...prev,
          progressCurrent: newCurrent,
          steps: prev.steps.map((s, i) => ({
            ...s,
            status: i < stepIdx ? 'completed' as const : i === stepIdx ? 'processing' as const : 'pending' as const,
          })),
          engines: prev.engines.map((e, i) => ({
            ...e,
            status: newCurrent > (i + 1) * 5 ? 'completed' as const : newCurrent > i * 5 ? 'syncing' as const : 'queued' as const,
          })),
        };
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const pctComplete = Math.round((progress.progressCurrent / progress.progressTotal) * 100);

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
            {isCompleted ? 'Analysis Complete' : 'Analysis In Progress'}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-body-lg max-w-2xl"
            style={{ color: 'var(--secondary)' }}
          >
            {isCompleted
              ? 'Your visibility analysis across 3 AI engines has finished. Review the results below.'
              : 'CiteScope is querying AI engines, extracting mentions, and analyzing competitive positioning. This typically takes 30–60 seconds.'}
          </motion.p>
        </header>

        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Left: Analysis Sequence */}
          <motion.div variants={cardEntrance} className="md:col-span-5 bento-card p-8">
            <h2 className="text-headline-sm mb-8" style={{ color: 'var(--primary)' }}>
              Analysis Sequence
            </h2>
            <div className="space-y-6">
              {progress.steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  variants={progressStep}
                  className="flex items-start gap-4"
                >
                  <div className="mt-0.5">
                    {step.status === 'completed' ? (
                      <CheckCircle2 size={22} style={{ color: 'var(--primary-container)' }} />
                    ) : step.status === 'processing' ? (
                      <Loader2 size={22} className="animate-spin" style={{ color: 'var(--tertiary-fixed-dim)' }} />
                    ) : (
                      <Circle size={22} style={{ color: 'var(--outline-variant)' }} />
                    )}
                  </div>
                  <div>
                    <p
                      className="text-body-md font-medium"
                      style={{
                        color: step.status === 'pending' ? 'var(--outline)' : 'var(--on-surface)',
                      }}
                    >
                      {step.label}
                    </p>
                    {step.status === 'processing' && (
                      <p className="text-sm mt-1" style={{ color: 'var(--secondary)' }}>
                        Processing...
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="md:col-span-7 space-y-6">
            {/* Overall Progress */}
            <motion.div variants={cardEntrance} className="bento-card p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-headline-sm" style={{ color: 'var(--primary)' }}>
                  Overall Progress
                </h2>
                <span className="text-label-caps" style={{ color: 'var(--secondary)' }}>
                  {progress.progressCurrent} / {progress.progressTotal} prompts
                </span>
              </div>
              <div className="text-metric-num mb-4" style={{ color: 'var(--primary)' }}>
                {pctComplete}%
              </div>
              <div
                className="h-3 rounded-full overflow-hidden mb-6"
                style={{ backgroundColor: 'var(--surface-container)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: 'var(--primary-container)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pctComplete}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {/* Engine Status */}
              <div className="flex gap-4">
                {progress.engines.map((engine) => (
                  <div
                    key={engine.name}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border"
                    style={{
                      borderColor: 'var(--outline-variant)',
                      backgroundColor:
                        engine.status === 'completed'
                          ? 'rgba(192, 236, 217, 0.3)'
                          : engine.status === 'syncing'
                          ? 'rgba(248, 189, 75, 0.2)'
                          : 'var(--surface-container)',
                    }}
                  >
                    {engine.status === 'completed' ? (
                      <CheckCircle2 size={14} style={{ color: 'var(--primary-container)' }} />
                    ) : engine.status === 'syncing' || engine.status === 'querying' ? (
                      <Loader2 size={14} className="animate-spin" style={{ color: 'var(--on-tertiary-fixed-variant)' }} />
                    ) : (
                      <Circle size={14} style={{ color: 'var(--outline)' }} />
                    )}
                    <span className="text-label-caps" style={{ color: 'var(--on-surface)' }}>
                      {engine.abbreviation}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Analyst Insight */}
            {progress.analystInsight && (
              <motion.div variants={cardEntrance}>
                <StickyNote
                  color="mustard"
                  rotation="slight-pos"
                  label="Analyst Insight"
                  labelIcon={<Lightbulb size={18} />}
                >
                  <p className="text-body-md leading-relaxed">{progress.analystInsight}</p>
                </StickyNote>
              </motion.div>
            )}

            {/* Completed CTA */}
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-end"
              >
                <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-label-caps"
                    style={{
                      backgroundColor: 'var(--primary-container)',
                      color: 'var(--on-primary)',
                    }}
                  >
                    View Visibility Dashboard
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
