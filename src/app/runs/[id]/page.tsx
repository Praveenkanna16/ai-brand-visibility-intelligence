'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import StickyNote from '@/components/ui/StickyNote';
import {
  CheckCircle2,
  Loader2,
  Circle,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  Zap,
  TrendingUp,
  Award,
  BarChart3,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { progressStep, fadeInUp, buttonHover, buttonTap, cardStagger, cardEntrance } from '@/lib/animations/variants';

export default function RunProgressPage() {
  const params = useParams();
  const id = (params?.id as string) || 'run-demo-001';

  const [progress, setProgress] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedResponses, setExpandedResponses] = useState<Record<string, boolean>>({});

  const toggleRawResponse = (resultId: string) => {
    setExpandedResponses((prev) => ({
      ...prev,
      [resultId]: !prev[resultId],
    }));
  };

  // Poll progress while status is QUEUED or RUNNING
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchProgress() {
      try {
        const res = await fetch(`/api/runs/${id}/progress`);
        if (!res.ok) {
          throw new Error('Failed to fetch run progress');
        }
        const data = await res.json();
        setProgress(data);
        setIsLoading(false);

        if (data.status === 'COMPLETED') {
          fetchReport();
        } else if (data.status === 'FAILED') {
          setError(data.error || 'Live analysis failed');
        }
      } catch (err: any) {
        console.error('Error fetching progress:', err);
        setIsLoading(false);
      }
    }

    async function fetchReport() {
      try {
        const cached = typeof window !== 'undefined' ? localStorage.getItem(`citescope_run_${id}`) : null;
        if (cached) {
          try {
            setReport(JSON.parse(cached));
          } catch {
            // ignore JSON parse error
          }
        }
        const res = await fetch(`/api/runs/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            setReport(data);
            try {
              localStorage.setItem(`citescope_run_${id}`, JSON.stringify(data));
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error('Error fetching full report:', err);
      }
    }

    fetchProgress();

    interval = setInterval(() => {
      if (!report && (!progress || progress.status === 'QUEUED' || progress.status === 'RUNNING')) {
        fetchProgress();
      } else if (progress?.status === 'COMPLETED' && !report) {
        fetchReport();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, progress?.status, report]);

  const isCompleted = progress?.status === 'COMPLETED';
  const isFailed = progress?.status === 'FAILED';
  const pctComplete = progress?.pctComplete ?? (isCompleted ? 100 : 0);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 size={36} className="animate-spin text-emerald-700 mb-4" />
        <p className="text-body-lg text-emerald-900 font-medium">Loading analysis state...</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-page py-16">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              style={{
                backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                color: isCompleted ? '#059669' : '#B45309',
                border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
              }}
            >
              <Zap size={14} className={isCompleted ? '' : 'animate-pulse'} />
              {isCompleted ? 'LIVE ANALYSIS REPORT' : 'LIVE GEMINI ANALYSIS IN PROGRESS'}
            </span>
          </div>

          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-display-lg mb-4"
            style={{ color: 'var(--primary)' }}
          >
            {isCompleted
              ? `Visibility Analysis: ${report?.brandName || progress?.brandName || 'Brand'}`
              : `Analyzing Visibility for ${progress?.brandName || 'Target Brand'}`}
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-body-lg max-w-3xl"
            style={{ color: 'var(--secondary)' }}
          >
            {isCompleted
              ? `Live execution finished across ${report?.results?.length || 0} prompt result(s). Review metrics, competitor positioning, and AI strategic briefs below.`
              : progress?.currentStepDetail || 'CiteScope is querying Gemini server-side, extracting mentions, and analyzing competitive positioning.'}
          </motion.p>
        </header>

        {isFailed && (
          <div className="mb-12 p-6 rounded-2xl border border-red-200 bg-red-50 text-red-900">
            <div className="flex items-center gap-3 mb-2 font-semibold text-lg">
              <AlertTriangle className="text-red-600" />
              Live Analysis Notice
            </div>
            <p className="text-sm">{error || 'An error occurred during Gemini API query execution.'}</p>
            <div className="mt-4">
              <Link href="/runs/new" className="px-5 py-2.5 rounded-full bg-red-600 text-white text-xs font-semibold uppercase tracking-wider inline-block">
                Try New Live Analysis
              </Link>
            </div>
          </div>
        )}

        {/* In-Progress Layout */}
        {!isCompleted && !isFailed && (
          <motion.div
            variants={cardStagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16"
          >
            {/* Left: Sequence Steps */}
            <motion.div variants={cardEntrance} className="md:col-span-5 bento-card p-8">
              <h2 className="text-headline-sm mb-8" style={{ color: 'var(--primary)' }}>
                Execution Sequence
              </h2>
              <div className="space-y-6">
                {(progress?.steps || []).map((step: any) => (
                  <motion.div key={step.number} variants={progressStep} className="flex items-start gap-4">
                    <div className="mt-0.5">
                      {step.status === 'completed' ? (
                        <CheckCircle2 size={22} style={{ color: 'var(--primary-container)' }} />
                      ) : step.status === 'processing' ? (
                        <Loader2 size={22} className="animate-spin text-amber-600" />
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
                        <p className="text-sm mt-1 text-amber-800 font-mono">
                          Processing...
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Progress Meter */}
            <div className="md:col-span-7 space-y-6">
              <motion.div variants={cardEntrance} className="bento-card p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-headline-sm" style={{ color: 'var(--primary)' }}>
                    Live Progress
                  </h2>
                  <span className="text-label-caps" style={{ color: 'var(--secondary)' }}>
                    {progress?.progressCurrent || 0} / {progress?.progressTotal || 0} tasks
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

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
                  ➜ {progress?.currentStepDetail || 'Querying Gemini API server-side...'}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Completed Report Layout */}
        {isCompleted && report && (
          <div className="space-y-12">
            {/* Top Score Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bento-card p-6 border-l-4 border-l-emerald-600">
                <div className="flex items-center justify-between text-label-caps mb-2 text-emerald-800">
                  <span>Visibility Score</span>
                  <TrendingUp size={18} />
                </div>
                <div className="text-4xl font-display font-bold text-emerald-950">
                  {report.metrics?.visibilityScore ?? 0}%
                </div>
                <p className="text-xs text-secondary mt-2">
                  Target brand detected in {report.metrics?.visibilityScore ?? 0}% of AI answers.
                </p>
              </div>

              <div className="bento-card p-6 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between text-label-caps mb-2 text-amber-800">
                  <span>Share of Voice</span>
                  <PieChartIcon size={18} />
                </div>
                <div className="text-4xl font-display font-bold text-amber-950">
                  {report.metrics?.shareOfMentions ?? 0}%
                </div>
                <p className="text-xs text-secondary mt-2">
                  Brand share vs all competitor mentions.
                </p>
              </div>

              <div className="bento-card p-6 border-l-4 border-l-indigo-600">
                <div className="flex items-center justify-between text-label-caps mb-2 text-indigo-800">
                  <span>Average Rank</span>
                  <Award size={18} />
                </div>
                <div className="text-4xl font-display font-bold text-indigo-950">
                  {report.metrics?.avgPosition ? `#${report.metrics.avgPosition}` : 'N/A'}
                </div>
                <p className="text-xs text-secondary mt-2">
                  Average position when listed in AI answers.
                </p>
              </div>

              <div className="bento-card p-6 border-l-4 border-l-purple-600">
                <div className="flex items-center justify-between text-label-caps mb-2 text-purple-800">
                  <span>Total Prompts</span>
                  <Layers size={18} />
                </div>
                <div className="text-4xl font-display font-bold text-purple-950">
                  {report.results?.length || 0}
                </div>
                <p className="text-xs text-secondary mt-2">
                  Queries analyzed across AI engines.
                </p>
              </div>
            </div>

            {/* Competitor Voice Share Breakdown */}
            {report.metrics?.competitorShares?.length > 0 && (
              <div className="bento-card p-8">
                <h2 className="text-headline-sm mb-6 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                  <BarChart3 size={20} className="text-emerald-700" />
                  Competitor Share of Mentions
                </h2>
                <div className="space-y-4">
                  {report.metrics.competitorShares.map((c: any) => (
                    <div key={c.name} className="space-y-1.5">
                      <div className="flex justify-between text-sm font-medium">
                        <span className={c.name === report.brandName ? 'font-bold text-emerald-800' : 'text-slate-700'}>
                          {c.name} {c.name === report.brandName ? '(Target Brand)' : ''}
                        </span>
                        <span className="font-mono">{c.share}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${c.share}%`,
                            backgroundColor: c.name === report.brandName ? 'var(--primary-container)' : '#94A3B8',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Insights & Gaps */}
            {report.insights?.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-headline-md font-display font-bold flex items-center gap-2 text-emerald-950">
                  <ShieldAlert className="text-amber-600" />
                  Detected Visibility Gaps & Strategic Recommendations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {report.insights.map((insight: any) => (
                    <div key={insight.id} className="bento-card p-6 flex flex-col justify-between border-t-4 border-t-amber-500">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                            Competitor Win: {insight.competitorName}
                          </span>
                          <span className="text-xs font-mono text-slate-500">Confidence: {Math.round((insight.confidence || 0.85) * 100)}%</span>
                        </div>
                        <h3 className="font-semibold text-body-lg mb-2 text-slate-900">
                          Query: "{insight.promptText}"
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed mb-4">
                          {insight.observation}
                        </p>
                        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 mb-4 text-xs text-amber-900 space-y-2">
                          <p><strong>Why Competitor Won:</strong> {insight.whyCompetitorWon}</p>
                          <p><strong>Recommended Action:</strong> {insight.recommendedAction}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <Link
                          href={`/insights/${insight.id}/brief`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition-colors"
                        >
                          View Actionable Content Brief
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt-by-Prompt Results & Raw Gemini Responses */}
            <div className="bento-card p-8">
              <h2 className="text-headline-sm mb-6 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <FileText size={20} className="text-emerald-700" />
                Prompt Execution Audit & Source AI Responses
              </h2>

              <div className="space-y-6">
                {(report.results || []).map((r: any, idx: number) => (
                  <div key={r.id || idx} className="p-6 rounded-2xl border border-slate-200 bg-white/70 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                          Prompt #{idx + 1}
                        </span>
                        <h3 className="text-body-lg font-semibold mt-2 text-slate-900">
                          "{r.promptText}"
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Engine: {r.engineName}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {r.mentioned ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 size={14} /> MENTIONED {r.position ? `(#${r.position})` : ''}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                            NOT MENTIONED
                          </span>
                        )}
                      </div>
                    </div>

                    {r.competitorsMentioned?.length > 0 && (
                      <div className="text-xs text-slate-600">
                        <strong>Competitors Detected:</strong> {r.competitorsMentioned.join(', ')}
                      </div>
                    )}

                    {/* Raw AI Response Inspector (Rule #8) */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => toggleRawResponse(r.id || String(idx))}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                      >
                        {expandedResponses[r.id || String(idx)] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {expandedResponses[r.id || String(idx)] ? 'Hide Raw AI Response' : 'Inspect Raw AI Response Source'}
                      </button>

                      {expandedResponses[r.id || String(idx)] && (
                        <div className="mt-3 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
                          {r.rawResponse || 'No raw response available.'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Methodology & AI Disclaimer (Rule #50 & #51) */}
            <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-2">
              <p className="font-semibold text-sm">Methodology & AI Limitations Disclaimer</p>
              <p>
                This report is based on the selected prompts and the live AI engine responses collected during this analysis run.
                Visibility scores reflect only this sampled set of queries and should not be treated as a universal measure of AI model behavior.
              </p>
              <p>
                AI answer engines are dynamic and responses can vary over time. CiteScope measurements serve as empirical audit snapshots for strategic marketing guidance.
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-6">
              <Link href="/dashboard" className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 transition-colors">
                ← Back to Dashboard
              </Link>
              <Link href="/runs/new" className="px-8 py-4 rounded-full bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-900 transition-colors flex items-center gap-2">
                Run Another Live Analysis
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function PieChartIcon(props: any) {
  return (
    <svg width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
