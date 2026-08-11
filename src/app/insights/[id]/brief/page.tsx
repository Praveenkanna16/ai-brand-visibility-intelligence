'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import StickyNote from '@/components/ui/StickyNote';
import { ArrowLeft, Sparkles, FileText, CheckCircle2, RefreshCw, Loader2, AlertTriangle, Zap } from 'lucide-react';
import { cardStagger, cardEntrance } from '@/lib/animations/variants';

export default function ContentBriefPage() {
  const params = useParams();
  const id = params?.id as string;

  const [brief, setBrief] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrafted, setIsDrafted] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadBrief() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/insights/${id}/brief`);
        if (res.ok) {
          const data = await res.json();
          setBrief(data);
          setIsDrafted(data.status === 'drafted');
        } else {
          setError('Strategic content brief not found.');
        }
      } catch (err) {
        console.error('Error fetching brief:', err);
        setError('Unable to connect to CiteScope server.');
      } finally {
        setIsLoading(false);
      }
    }
    loadBrief();
  }, [id]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/insights/${id}/brief`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setBrief(data);
      }
    } catch (err) {
      console.error('Regeneration error:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const toggleDrafted = () => {
    setIsDrafted(!isDrafted);
    if (brief) {
      setBrief({ ...brief, status: !isDrafted ? 'drafted' : 'generated' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 size={36} className="animate-spin text-emerald-700 mb-4" />
        <p className="text-body-md text-emerald-900 font-medium">Loading content strategy brief...</p>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-page py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-800 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-display-md mb-4 text-slate-900 font-display">
            Strategic Brief Not Found
          </h1>
          <p className="text-body-lg text-slate-600 max-w-xl mx-auto mb-8">
            {error || 'The requested strategic content brief could not be found in the database.'}
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

  const b = brief;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-page py-12">
        {/* Top Actions & Breadcrumb */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href={`/insights/${id}`}
            className="inline-flex items-center gap-2 text-label-caps hover:opacity-70 transition-opacity"
            style={{ color: 'var(--secondary)' }}
          >
            <ArrowLeft size={14} /> Back to Visibility Insight
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-label-caps transition-colors hover:opacity-70 disabled:opacity-50"
              style={{
                borderColor: 'var(--outline-variant)',
                color: 'var(--secondary)',
              }}
            >
              <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate Brief'}
            </button>
            <button
              onClick={toggleDrafted}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-label-caps font-bold transition-all"
              style={{
                backgroundColor: isDrafted ? 'var(--primary-fixed)' : 'var(--primary-container)',
                color: isDrafted ? 'var(--on-primary-fixed)' : 'var(--on-primary)',
              }}
            >
              {isDrafted ? (
                <>
                  <CheckCircle2 size={16} /> Mark as Drafted
                </>
              ) : (
                'Mark as Drafted'
              )}
            </button>
          </div>
        </div>

        {/* Header */}
        <header className="mb-12">
          <span
            className="px-3 py-1 rounded-full text-label-caps border inline-block mb-3"
            style={{
              backgroundColor: 'rgba(192, 236, 217, 0.4)',
              color: 'var(--on-primary-fixed-variant)',
              borderColor: 'var(--primary-fixed)',
            }}
          >
            AI Strategy Brief
          </span>
          <h1 className="text-display-lg mb-4" style={{ color: 'var(--primary)' }}>
            {b.title}
          </h1>
        </header>

        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-8"
        >
          {/* Main Brief Document */}
          <motion.div variants={cardEntrance} className="md:col-span-8 space-y-8">
            <div className="bento-card p-8 md:p-12 space-y-8">
              {/* Strategic Angle */}
              <div>
                <h3 className="text-headline-sm mb-3 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                  <Sparkles size={20} style={{ color: 'var(--tertiary-container)' }} />
                  Strategic Angle
                </h3>
                <p className="text-body-lg leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                  {b.strategicAngle}
                </p>
              </div>

              <hr style={{ borderColor: 'var(--outline-variant)' }} />

              {/* Format & Asset */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-label-caps mb-1" style={{ color: 'var(--secondary)' }}>
                    Format Type
                  </label>
                  <p className="text-body-md font-bold" style={{ color: 'var(--primary)' }}>
                    {b.formatType}
                  </p>
                </div>
                <div>
                  <label className="block text-label-caps mb-1" style={{ color: 'var(--secondary)' }}>
                    Primary Asset
                  </label>
                  <p className="text-body-md font-bold" style={{ color: 'var(--primary)' }}>
                    {b.primaryAsset}
                  </p>
                </div>
              </div>

              <hr style={{ borderColor: 'var(--outline-variant)' }} />

              {/* Recommended Structure */}
              <div>
                <h3 className="text-headline-sm mb-6 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                  <FileText size={20} style={{ color: 'var(--primary-container)' }} />
                  Recommended Article Outline
                </h3>
                <div className="space-y-4">
                  {(b.recommendedStructure || []).map((sec: any, i: number) => (
                    <div
                      key={i}
                      className="p-5 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--surface-container-low)',
                        borderColor: 'var(--outline-variant)',
                      }}
                    >
                      <h4 className="text-headline-sm text-lg mb-2" style={{ color: 'var(--primary)' }}>
                        {sec.title}
                      </h4>
                      <p className="text-body-md" style={{ color: 'var(--secondary)' }}>
                        {sec.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <hr style={{ borderColor: 'var(--outline-variant)' }} />

              {/* Evidence & Reasoning */}
              <div>
                <h3 className="text-headline-sm mb-3" style={{ color: 'var(--primary)' }}>
                  Evidence to Include
                </h3>
                <p className="text-body-md leading-relaxed" style={{ color: 'var(--secondary)' }}>
                  {b.evidenceToInclude}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Sidebar: Strategic Context */}
          <motion.div variants={cardEntrance} className="md:col-span-4 space-y-6">
            <div className="bento-card p-6 space-y-6">
              <h3 className="text-headline-sm" style={{ color: 'var(--primary)' }}>
                Strategic Context
              </h3>

              <div>
                <label className="block text-label-caps mb-1" style={{ color: 'var(--secondary)' }}>
                  Target Query
                </label>
                <p className="text-body-md font-medium" style={{ color: 'var(--on-surface)' }}>
                  "{b.targetQuery}"
                </p>
              </div>

              <div>
                <label className="block text-label-caps mb-1" style={{ color: 'var(--secondary)' }}>
                  Visibility Gap Level
                </label>
                <span
                  className="px-3 py-1 rounded-full text-label-caps inline-block"
                  style={{
                    backgroundColor: 'var(--error-container)',
                    color: 'var(--on-error-container)',
                  }}
                >
                  {b.visibilityGap || 'High'} Risk Gap
                </span>
              </div>
            </div>

            {/* Analyst Note Sticky Note */}
            <StickyNote
              color="mustard"
              rotation="slight-neg"
              label="Analyst Strategic Note"
              labelIcon={<Sparkles size={18} />}
            >
              <p className="text-body-md leading-relaxed" style={{ color: '#271900' }}>
                {b.analystNote || b.competitorAdvantage || b.reasoning}
              </p>
            </StickyNote>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
