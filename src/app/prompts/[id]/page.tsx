'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import StickyNote from '@/components/ui/StickyNote';
import { demoRunResults } from '@/lib/demo/data';
import { ArrowLeft, AlertCircle, Sparkles, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { fadeInUp, cardStagger, cardEntrance } from '@/lib/animations/variants';

export default function PromptInvestigationPage({ params }: { params: { id: string } }) {
  const result = demoRunResults.find((r) => r.id === params.id) || demoRunResults[0];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-page py-12">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            href="/prompts"
            className="inline-flex items-center gap-2 text-label-caps hover:opacity-70 transition-opacity"
            style={{ color: 'var(--secondary)' }}
          >
            <ArrowLeft size={14} /> Back to Prompts Matrix
          </Link>
        </div>

        {/* Prompt Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span
              className="px-3 py-1 rounded-full text-label-caps border"
              style={{
                backgroundColor: 'var(--surface-container)',
                borderColor: 'var(--outline-variant)',
                color: 'var(--secondary)',
              }}
            >
              Engine: {result.engine?.displayName}
            </span>
            {result.mentioned ? (
              <span
                className="px-3 py-1 rounded-full text-label-caps border"
                style={{
                  backgroundColor: 'rgba(192, 236, 217, 0.4)',
                  color: 'var(--on-primary-fixed-variant)',
                  borderColor: 'var(--primary-fixed)',
                }}
              >
                Mentioned #{result.position}
              </span>
            ) : (
              <span
                className="px-3 py-1 rounded-full text-label-caps border flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--error-container)',
                  color: 'var(--on-error-container)',
                  borderColor: '#ffb4ab',
                }}
              >
                <AlertCircle size={14} /> Gap Detected
              </span>
            )}
          </div>

          <h1 className="text-display-lg" style={{ color: 'var(--primary)' }}>
            "{result.prompt?.text}"
          </h1>
        </header>

        {/* 2-Column Content */}
        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-8"
        >
          {/* Main Raw Response */}
          <motion.div variants={cardEntrance} className="md:col-span-8 space-y-6">
            <div className="bento-card p-8">
              <h2 className="text-headline-sm mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <Sparkles size={20} style={{ color: 'var(--tertiary-container)' }} />
                Synthesized AI Response
              </h2>
              <div
                className="p-6 rounded-xl text-body-lg leading-relaxed font-body border space-y-4 whitespace-pre-line"
                style={{
                  backgroundColor: 'var(--surface-container-low)',
                  borderColor: 'var(--outline-variant)',
                  color: 'var(--on-surface)',
                }}
              >
                {result.rawResponse}
              </div>
            </div>

            {/* Attribution & Evidence */}
            {result.evidence && result.evidence.length > 0 && (
              <div className="bento-card p-8">
                <h2 className="text-headline-sm mb-6 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                  <FileText size={20} style={{ color: 'var(--primary-container)' }} />
                  Attribution & Synthesized Evidence
                </h2>
                <div className="space-y-4">
                  {result.evidence.map((ev, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--surface-container-lowest)',
                        borderColor: 'var(--outline-variant)',
                      }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-label-caps font-bold" style={{ color: 'var(--primary-container)' }}>
                          {ev.source}
                        </span>
                        <span className="text-xs text-outline">Confidence: {result.confidence ? `${Math.round(result.confidence * 100)}%` : 'High'}</span>
                      </div>
                      <h4 className="text-body-md font-bold mb-1" style={{ color: 'var(--primary)' }}>
                        {ev.title}
                      </h4>
                      <p className="text-body-md" style={{ color: 'var(--secondary)' }}>
                        {ev.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Sidebar: Analyst Brief & CTA */}
          <motion.div variants={cardEntrance} className="md:col-span-4 space-y-6">
            <StickyNote
              color="mustard"
              rotation="none"
              label="Analyst Brief"
              labelIcon={<Sparkles size={18} />}
            >
              <p className="text-body-md leading-relaxed mb-6" style={{ color: '#271900' }}>
                {result.mentioned
                  ? `Pixis received a position #${result.position} mention in this response. The sentiment is positive, emphasizing codeless AI infrastructure.`
                  : `Target brand was not cited in this response. Primary citations went to Smartly.io and Madgicx.`}
              </p>
              <div className="pt-4 border-t border-black/10">
                <Link
                  href="/insights/insight-001"
                  className="inline-flex items-center gap-2 text-label-caps font-bold transition-transform hover:translate-x-1"
                  style={{ color: '#5e4200' }}
                >
                  View Gap Analysis <ChevronRight size={14} />
                </Link>
              </div>
            </StickyNote>

            {/* Strategic CTA Card */}
            <div className="bento-card p-6" style={{ backgroundColor: 'var(--surface-container-lowest)' }}>
              <h3 className="text-headline-sm mb-2" style={{ color: 'var(--primary)' }}>
                Actionable Next Step
              </h3>
              <p className="text-body-md mb-6" style={{ color: 'var(--secondary)' }}>
                Generate a targeted marketing content brief to address this visibility gap.
              </p>
              <Link
                href="/insights/insight-001/brief"
                className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 rounded-full text-label-caps font-bold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--primary-container)',
                  color: 'var(--on-primary)',
                }}
              >
                Create Content Brief <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
