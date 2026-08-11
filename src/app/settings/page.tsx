'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import { demoSettings } from '@/lib/demo/data';
import { Building2, Users, Cpu, Trash2, Plus, Check } from 'lucide-react';
import { fadeInUp, cardStagger, cardEntrance, buttonHover, buttonTap } from '@/lib/animations/variants';

export default function SettingsPage() {
  const [brandName, setBrandName] = useState(demoSettings.brand.name);
  const [brandDomain, setBrandDomain] = useState(demoSettings.brand.domain);
  const [brandDesc, setBrandDesc] = useState(demoSettings.brand.description);

  const [competitors, setCompetitors] = useState(demoSettings.competitors);
  const [newCompName, setNewCompName] = useState('');

  const [engines, setEngines] = useState(demoSettings.engines);

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveProfile = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
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

  const toggleEngine = (id: string) => {
    setEngines(
      engines.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
    );
  };

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
            className="mb-8 p-4 rounded-xl border flex items-center gap-3 text-body-md font-bold animate-fadeIn"
            style={{
              backgroundColor: 'rgba(192, 236, 217, 0.4)',
              borderColor: 'var(--primary-fixed)',
              color: 'var(--on-primary-fixed-variant)',
            }}
          >
            <Check size={18} /> Settings updated successfully!
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
                  className="px-6 py-3 rounded-full border text-label-caps font-bold transition-colors hover:bg-surface-container-high"
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
                  AI Engine Preferences
                </h2>
                <p className="text-body-md" style={{ color: 'var(--secondary)' }}>
                  Select which LLMs to include in your visibility analysis.
                </p>
              </div>
              <Cpu size={24} style={{ color: 'var(--outline)' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {engines.map((engine) => (
                <div
                  key={engine.id}
                  onClick={() => toggleEngine(engine.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                    engine.enabled ? 'ring-1' : 'opacity-60'
                  }`}
                  style={{
                    backgroundColor: 'var(--surface-container-lowest)',
                    borderColor: engine.enabled ? 'var(--primary-container)' : 'var(--outline-variant)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={engine.enabled}
                    onChange={() => {}}
                    className="mt-1 rounded"
                  />
                  <div>
                    <h4 className="text-body-lg font-bold mb-1" style={{ color: 'var(--primary)' }}>
                      {engine.displayName}
                    </h4>
                    <p className="text-body-md text-sm" style={{ color: 'var(--secondary)' }}>
                      {engine.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
