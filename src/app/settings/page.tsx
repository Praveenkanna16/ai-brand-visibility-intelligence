'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import { Building2, Users, Cpu, Trash2, Check, Loader2 } from 'lucide-react';
import { fadeInUp, cardStagger, cardEntrance, buttonHover, buttonTap } from '@/lib/animations/variants';

export default function SettingsPage() {
  const [brandName, setBrandName] = useState('');
  const [brandDomain, setBrandDomain] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  const [competitors, setCompetitors] = useState<Array<{ id: string; name: string }>>([]);
  const [newCompName, setNewCompName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.brand) {
            setBrandName(data.brand.name || '');
            setBrandDomain(data.brand.domain || '');
            setBrandDesc(data.brand.description || '');
          }
          if (data.competitors) {
            setCompetitors(data.competitors);
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          brandDomain,
          brandDescription: brandDesc,
        }),
      });

      if (res.ok) {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  const handleAddCompetitor = () => {
    if (newCompName.trim()) {
      setCompetitors([
        ...competitors,
        { id: `comp-${Date.now()}`, name: newCompName.trim() },
      ]);
      setNewCompName('');
    }
  };

  const handleRemoveCompetitor = (id: string) => {
    setCompetitors(competitors.filter((c) => c.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 size={36} className="animate-spin text-emerald-700 mb-4" />
        <p className="text-body-md text-emerald-900 font-medium">Loading workspace settings...</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-page py-16">
        {/* Header */}
        <header className="mb-12">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-display-lg mb-4"
            style={{ color: 'var(--primary)' }}
          >
            Workspace Settings
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-body-lg"
            style={{ color: 'var(--secondary)' }}
          >
            Configure your brand profile, competitor tracking, and AI engine preferences for CiteScope analysis.
          </motion.p>
        </header>

        {savedNotice && (
          <div
            className="mb-8 p-4 rounded-xl border flex items-center gap-3 text-body-md font-bold"
            style={{
              backgroundColor: 'rgba(192, 236, 217, 0.4)',
              borderColor: 'var(--primary-fixed)',
              color: 'var(--on-primary-fixed-variant)',
            }}
          >
            <Check size={18} /> Settings updated in PostgreSQL database!
          </div>
        )}

        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Card 1: Brand Profile */}
          <motion.div variants={cardEntrance} className="bento-card p-8 md:p-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-headline-sm flex items-center gap-2 mb-1" style={{ color: 'var(--primary)' }}>
                  Brand Profile
                </h2>
                <p className="text-body-md" style={{ color: 'var(--secondary)' }}>
                  The primary entity you are tracking for LLM visibility.
                </p>
              </div>
              <Building2 size={24} style={{ color: 'var(--outline)' }} />
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-label-caps mb-2" style={{ color: 'var(--secondary)' }}>
                    Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Nike or Pixis"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="input-editorial w-full"
                  />
                </div>
                <div>
                  <label className="block text-label-caps mb-2" style={{ color: 'var(--secondary)' }}>
                    Primary Domain
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., nike.in or pixis.ai"
                    value={brandDomain}
                    onChange={(e) => setBrandDomain(e.target.value)}
                    className="input-editorial w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-caps mb-2" style={{ color: 'var(--secondary)' }}>
                  Brand Description (Context for Analysis)
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide brief context about products/services..."
                  value={brandDesc}
                  onChange={(e) => setBrandDesc(e.target.value)}
                  className="input-editorial w-full resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <motion.button
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  onClick={handleSaveProfile}
                  className="px-6 py-3 rounded-full border text-label-caps font-bold hover:bg-slate-100 transition-colors"
                  style={{
                    borderColor: 'var(--outline-variant)',
                    color: 'var(--on-surface)',
                  }}
                >
                  Save Profile
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Competitor List */}
          <motion.div variants={cardEntrance} className="bento-card p-8 md:p-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-headline-sm flex items-center gap-2 mb-1" style={{ color: 'var(--primary)' }}>
                  Competitor List
                </h2>
                <p className="text-body-md" style={{ color: 'var(--secondary)' }}>
                  Entities to track for Share of Voice comparisons.
                </p>
              </div>
              <Users size={24} style={{ color: 'var(--outline)' }} />
            </div>

            <div className="space-y-4 mb-6">
              {competitors.map((comp) => (
                <div
                  key={comp.id}
                  className="flex justify-between items-center p-4 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--surface-container-low)',
                    borderColor: 'var(--outline-variant)',
                  }}
                >
                  <span className="text-body-lg font-medium" style={{ color: 'var(--on-surface)' }}>
                    {comp.name}
                  </span>
                  <button
                    onClick={() => handleRemoveCompetitor(comp.id)}
                    className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Add competitor name..."
                value={newCompName}
                onChange={(e) => setNewCompName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCompetitor()}
                className="input-editorial flex-grow"
              />
              <button
                onClick={handleAddCompetitor}
                className="px-6 py-3 rounded-full text-label-caps font-bold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--primary-container)',
                  color: 'var(--on-primary)',
                }}
              >
                Add Entity
              </button>
            </div>
          </motion.div>

          {/* Card 3: AI Engine Preferences */}
          <motion.div variants={cardEntrance} className="bento-card p-8 md:p-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-headline-sm flex items-center gap-2 mb-1" style={{ color: 'var(--primary)' }}>
                  AI Engine Configuration
                </h2>
                <p className="text-body-md" style={{ color: 'var(--secondary)' }}>
                  Active LLM providers configured for server-side execution.
                </p>
              </div>
              <Cpu size={24} style={{ color: 'var(--outline)' }} />
            </div>

            <div className="p-5 rounded-xl border bg-emerald-50/50 border-emerald-200 flex items-start gap-4">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse mt-1.5" />
              <div>
                <h4 className="text-body-lg font-bold text-emerald-950 mb-1">
                  Gemini (Live Server-Side Execution)
                </h4>
                <p className="text-body-md text-emerald-800 text-sm">
                  Google Gemini 2.5 Flash model with 30s timeouts, bounded retries, and exponential backoff.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
