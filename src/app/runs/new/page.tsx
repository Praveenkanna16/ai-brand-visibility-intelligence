'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import { Target, Users, Cpu, MessageSquare, X, Plus, ArrowRight, Loader2, Zap } from 'lucide-react';
import { buttonHover, buttonTap, fadeInUp } from '@/lib/animations/variants';

const defaultEngines = [
  { id: 'gemini', label: 'Gemini Advanced (Live)', checked: true },
  { id: 'chatgpt', label: 'ChatGPT (GPT-4)', checked: true },
  { id: 'perplexity', label: 'Perplexity Pro', checked: true },
  { id: 'claude', label: 'Claude 3.5 Opus', checked: false },
];

export default function NewRunPage() {
  const router = useRouter();
  const [brandName, setBrandName] = useState('Pixis');
  const [brandDomain, setBrandDomain] = useState('pixis.ai');
  const [competitors, setCompetitors] = useState(['Smartly.io', 'Albert.ai', 'Madgicx', 'AdCreative.ai']);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [engines, setEngines] = useState(defaultEngines);
  const [prompts, setPrompts] = useState([
    'What are the best AI platforms for optimizing advertising campaigns for ecommerce brands?',
    'What are the best AI tools for improving ROAS?',
    'Which AI platforms help brands automate paid advertising?',
  ]);
  const [newPrompt, setNewPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleEngine = (id: string) => {
    setEngines((prev) =>
      prev.map((e) => (e.id === id ? { ...e, checked: !e.checked } : e))
    );
  };

  const addCompetitor = () => {
    if (newCompetitor.trim()) {
      setCompetitors([...competitors, newCompetitor.trim()]);
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (idx: number) => {
    setCompetitors(competitors.filter((_, i) => i !== idx));
  };

  const removePrompt = (idx: number) => {
    setPrompts(prompts.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    const activePrompts = [...prompts];
    if (newPrompt.trim()) {
      activePrompts.push(newPrompt.trim());
    }

    if (!brandName.trim()) {
      setErrorMsg('Target Brand name is required.');
      return;
    }

    if (activePrompts.length === 0) {
      setErrorMsg('At least one prompt is required.');
      return;
    }

    const selectedEngines = engines.filter((e) => e.checked).map((e) => e.id);
    if (selectedEngines.length === 0) {
      setErrorMsg('At least one AI engine must be selected.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandName.trim(),
          brandDomain: brandDomain.trim(),
          competitors,
          engines: selectedEngines,
          prompts: activePrompts,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create analysis run');
      }

      // Redirect directly to the analysis progress page
      router.push(`/runs/${data.id}`);
    } catch (err: any) {
      console.error('Run creation error:', err);
      setErrorMsg(err.message || 'Failed to start live analysis');
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="pt-6 pb-16 px-page max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="mb-12 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#059669',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <Zap size={14} className="animate-pulse" />
              LIVE ANALYSIS ENGINE
            </span>
          </div>

          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-display-lg mb-4"
            style={{ color: 'var(--primary)' }}
          >
            Run a Live Visibility Analysis
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
            className="text-body-lg max-w-2xl"
            style={{ color: 'var(--secondary)' }}
          >
            Configure your target brand, competitors, and industry queries below. CiteScope will query live AI engines to measure your exact brand visibility.
          </motion.p>
        </header>

        {errorMsg && (
          <div className="mb-8 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Main Form Card */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.25 }}
          className="bento-card p-8 md:p-12"
        >
          <form
            className="space-y-12"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Target Brand */}
            <section>
              <h2 className="text-headline-sm mb-6 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <Target size={20} style={{ color: 'var(--tertiary-container)' }} />
                Target Brand
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-label-caps mb-2" style={{ color: 'var(--secondary)' }}>
                    Brand Name *
                  </label>
                  <input
                    className="input-editorial w-full text-body-lg"
                    type="text"
                    placeholder="e.g., Pixis or Nike"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-label-caps mb-2" style={{ color: 'var(--secondary)' }}>
                    Primary Domain
                  </label>
                  <input
                    className="input-editorial w-full text-body-lg"
                    type="text"
                    placeholder="e.g., pixis.ai"
                    value={brandDomain}
                    onChange={(e) => setBrandDomain(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <hr style={{ borderColor: 'var(--outline-variant)' }} />

            {/* Competitors */}
            <section className="relative">
              <div
                className="absolute -right-4 -top-8 p-4 rounded-lg w-48 z-10 hidden md:block"
                style={{
                  backgroundColor: 'var(--tertiary-fixed)',
                  color: 'var(--on-tertiary-fixed-variant)',
                  transform: 'rotate(1.5deg)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <p className="text-label-caps mb-1">Analyst Note</p>
                <p className="text-sm leading-tight">
                  Adding at least 2–4 competitors yields robust Share of Voice comparison metrics.
                </p>
              </div>

              <h2 className="text-headline-sm mb-6 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <Users size={20} style={{ color: 'var(--tertiary-container)' }} />
                Competitors
              </h2>
              <div className="space-y-4">
                {competitors.map((c, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <input
                      className="input-editorial flex-grow text-body-lg"
                      type="text"
                      value={c}
                      onChange={(e) => {
                        const updated = [...competitors];
                        updated[i] = e.target.value;
                        setCompetitors(updated);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeCompetitor(i)}
                      className="p-2 rounded-full transition-colors hover:opacity-70"
                      style={{ color: 'var(--outline)' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-4">
                  <input
                    className="input-editorial flex-grow text-body-lg"
                    type="text"
                    placeholder="Add another competitor..."
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
                    style={{ color: 'var(--outline)' }}
                  />
                  <button
                    type="button"
                    onClick={addCompetitor}
                    className="p-2 rounded-full transition-colors hover:opacity-70"
                    style={{ color: 'var(--primary-container)' }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </section>

            <hr style={{ borderColor: 'var(--outline-variant)' }} />

            {/* AI Engines */}
            <section>
              <h2 className="text-headline-sm mb-6 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <Cpu size={20} style={{ color: 'var(--tertiary-container)' }} />
                AI Engines
              </h2>
              <div className="flex flex-wrap gap-4">
                {engines.map((engine) => (
                  <label key={engine.id} className="cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={engine.checked}
                      onChange={() => toggleEngine(engine.id)}
                    />
                    <div
                      className="px-6 py-3 rounded-full border text-label-caps transition-all peer-checked:text-white"
                      style={{
                        backgroundColor: engine.checked ? 'var(--primary-container)' : 'transparent',
                        color: engine.checked ? 'var(--on-primary)' : 'var(--secondary)',
                        borderColor: engine.checked ? 'var(--primary-container)' : 'var(--outline-variant)',
                      }}
                    >
                      {engine.label}
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <hr style={{ borderColor: 'var(--outline-variant)' }} />

            {/* Category Prompts */}
            <section>
              <h2 className="text-headline-sm mb-6 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <MessageSquare size={20} style={{ color: 'var(--tertiary-container)' }} />
                Category Prompts
              </h2>
              <p className="text-body-md mb-6" style={{ color: 'var(--secondary)' }}>
                Enter the natural language questions users ask AI answer engines when researching your category.
              </p>
              <div className="space-y-6">
                {prompts.map((p, i) => (
                  <div key={i} className="relative flex items-start gap-3">
                    <span
                      className="text-sm font-display pt-3"
                      style={{ color: 'var(--secondary)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <textarea
                      className="input-editorial w-full text-body-lg resize-none"
                      rows={2}
                      value={p}
                      onChange={(e) => {
                        const updated = [...prompts];
                        updated[i] = e.target.value;
                        setPrompts(updated);
                      }}
                    />
                    {prompts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrompt(i)}
                        className="p-2 pt-3 rounded-full transition-colors hover:opacity-70"
                        style={{ color: 'var(--outline)' }}
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <div className="relative flex items-start gap-3">
                  <span
                    className="text-sm font-display pt-3"
                    style={{ color: 'var(--outline)' }}
                  >
                    {String(prompts.length + 1).padStart(2, '0')}
                  </span>
                  <textarea
                    className="input-editorial w-full text-body-lg resize-none"
                    rows={2}
                    placeholder="Add another natural query prompt..."
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && newPrompt.trim()) {
                        e.preventDefault();
                        setPrompts([...prompts, newPrompt.trim()]);
                        setNewPrompt('');
                      }
                    }}
                    style={{ color: 'var(--outline)' }}
                  />
                </div>
              </div>
            </section>

            {/* Actions */}
            <div
              className="pt-8 flex items-center justify-between border-t mt-12"
              style={{ borderColor: 'var(--outline-variant)' }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                Live Gemini Server-Side Execution Enabled
              </div>

              <div className="flex gap-4">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className="px-8 py-4 rounded-full text-label-caps flex items-center gap-3 shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--primary-container)',
                    color: 'var(--on-primary)',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Queuing Analysis...
                    </>
                  ) : (
                    <>
                      <Zap size={18} className="text-yellow-300 fill-yellow-300" />
                      RUN LIVE ANALYSIS
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}
