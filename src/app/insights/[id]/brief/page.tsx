'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import StickyNote from '@/components/ui/StickyNote';
import { demoBrief } from '@/lib/demo/data';
import { ArrowLeft, Sparkles, FileText, Check, RefreshCw, CheckCircle2 } from 'lucide-react';
import { fadeInUp, cardStagger, cardEntrance } from '@/lib/animations/variants';

export default function ContentBriefPage() {
  const [brief, setBrief] = useState(demoBrief);
  const [isDrafted, setIsDrafted] = useState(brief.status === 'drafted');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 1200);
  };

  const toggleDrafted = () => {
    setIsDrafted(!isDrafted);
    setBrief({ ...brief, status: !isDrafted ? 'drafted' : 'generated' });
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-page py-12">
        {/* Top Actions & Breadcrumb */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/insights/insight-001"
            className="inline-flex items-center gap-2 text-label-caps hover:opacity-70 transition-opacity"
            style={{ color: 'var(--secondary)' }}
          >
            <ArrowLeft size={14} /> Back to Visibility Gap
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-label-caps transition-colors hover:opacity-70"
              style={{
                borderColor: 'var(--outline-variant)',
                color: 'var(--secondary)',
              }}
            >
              <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
              Regenerate Brief
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
            {brief.title}
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
                  {brief.strategicAngle}
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
                    {brief.formatType}
                  </p>
                </div>
                <div>
                  <label className="block text-label-caps mb-1" style={{ color: 'var(--secondary)' }}>
                    Primary Asset
                  </label>
                  <p className="text-body-md font-bold" style={{ color: 'var(--primary)' }}>
                    {brief.primaryAsset}
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
                  {brief.recommendedStructure?.map((sec, i) => (
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
                  {brief.evidenceToInclude}
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
                  "{brief.targetQuery}"
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
                  {brief.visibilityGap} Risk Gap
                </span>
              </div>

              {brief.winningCompetitors && (
                <div>
                  <label className="block text-label-caps mb-2" style={{ color: 'var(--secondary)' }}>
                    Winning Competitors
                  </label>
                  <div className="space-y-2">
                    {brief.winningCompetitors.map((comp) => (
                      <div
                        key={comp.name}
                        className="flex justify-between items-center text-body-md p-2 rounded border"
                        style={{
                          backgroundColor: 'var(--surface-container-low)',
                          borderColor: 'var(--outline-variant)',
                        }}
                      >
                        <span>{comp.name}</span>
                        <span className="font-bold text-xs" style={{ color: 'var(--primary-container)' }}>
                          Rank #{comp.rank}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Analyst Note Sticky Note */}
            <StickyNote
              color="mustard"
              rotation="slight-neg"
              label="Analyst Strategic Note"
              labelIcon={<Sparkles size={18} />}
            >
              <p className="text-body-md leading-relaxed" style={{ color: '#271900' }}>
                {brief.analystNote || brief.competitorAdvantage}
              </p>
            </StickyNote>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
