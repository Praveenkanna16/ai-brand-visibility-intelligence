'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import StickyNote from '@/components/ui/StickyNote';
import { ArrowLeft, AlertCircle, Sparkles, FileText, CheckCircle2, ChevronRight, Loader2, Zap } from 'lucide-react';
import { fadeInUp, cardStagger, cardEntrance } from '@/lib/animations/variants';

export default function PromptInvestigationPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadPromptDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/prompts/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError('Prompt result not found.');
        }
      } catch (err) {
        console.error('Error fetching prompt details:', err);
        setError('Unable to connect to CiteScope server.');
      } finally {
        setIsLoading(false);
      }
    }
    loadPromptDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 size={36} className="animate-spin text-emerald-700 mb-4" />
        <p className="text-body-md text-emerald-900 font-medium">Loading prompt analysis details...</p>
      </div>
    );
  }

  if (error || !data || !data.result) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-page py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-800 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-display-md mb-4 text-slate-900 font-display">
            Prompt Detail Not Found
          </h1>
          <p className="text-body-lg text-slate-600 max-w-xl mx-auto mb-8">
            {error || 'The requested prompt execution details could not be found.'}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/prompts"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors"
            >
              Back to Prompts Matrix
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

  const result = data.result;
  const promptText = data.prompt?.text || 'Category Prompt';
  const brandName = data.brandName || 'Target Brand';

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
              Engine: {result.engineName || 'Gemini'}
            </span>
            {result.mentioned ? (
              <span
                className="px-3 py-1 rounded-full text-label-caps border flex items-center gap-1"
                style={{
                  backgroundColor: 'rgba(192, 236, 217, 0.4)',
                  color: 'var(--on-primary-fixed-variant)',
                  borderColor: 'var(--primary-fixed)',
                }}
              >
                <CheckCircle2 size={14} /> Mentioned {result.position ? `#${result.position}` : ''}
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
            "{promptText}"
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
                Synthesized AI Response (Source text)
              </h2>
              <div
                className="p-6 rounded-xl text-body-lg leading-relaxed font-mono text-xs border space-y-4 whitespace-pre-wrap max-h-96 overflow-y-auto"
                style={{
                  backgroundColor: 'var(--surface-container-low)',
                  borderColor: 'var(--outline-variant)',
                  color: 'var(--on-surface)',
                }}
              >
                {result.rawResponse || 'No raw response recorded.'}
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
                  {result.evidence.map((ev: any, i: number) => (
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
                        <span className="text-xs text-outline">
                          Confidence: {result.confidence ? `${Math.round(result.confidence * 100)}%` : 'High'}
                        </span>
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
              label="Audit Brief"
              labelIcon={<Sparkles size={18} />}
            >
              <p className="text-body-md leading-relaxed mb-6" style={{ color: '#271900' }}>
                {result.mentioned
                  ? `${brandName} received a position #${result.position || 'listed'} mention in this response.`
                  : `${brandName} was not cited in this response. Competitors detected: ${result.competitorsMentioned.join(', ') || 'None'}.`}
              </p>
              <div className="pt-4 border-t border-black/10">
                <Link
                  href={`/runs/${result.runId}`}
                  className="inline-flex items-center gap-2 text-label-caps font-bold transition-transform hover:translate-x-1"
                  style={{ color: '#5e4200' }}
                >
                  View Full Run Report <ChevronRight size={14} />
                </Link>
              </div>
            </StickyNote>

            {/* Strategic CTA Card */}
            <div className="bento-card p-6" style={{ backgroundColor: 'var(--surface-container-lowest)' }}>
              <h3 className="text-headline-sm mb-2" style={{ color: 'var(--primary)' }}>
                Actionable Next Step
              </h3>
              <p className="text-body-md mb-6" style={{ color: 'var(--secondary)' }}>
                Review full visibility gaps and strategic recommendations for this run.
              </p>
              <Link
                href={`/runs/${result.runId}`}
                className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 rounded-full text-label-caps font-bold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--primary-container)',
                  color: 'var(--on-primary)',
                }}
              >
                View Full Analysis <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
