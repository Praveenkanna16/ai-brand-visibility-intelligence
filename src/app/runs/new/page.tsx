'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import { Target, Users, Cpu, MessageSquare, X, Plus, ArrowRight } from 'lucide-react';
import { buttonHover, buttonTap, fadeInUp } from '@/lib/animations/variants';

const defaultEngines = [
  { id: 'chatgpt', label: 'ChatGPT (GPT-4)', checked: true },
  { id: 'gemini', label: 'Gemini Advanced', checked: true },
  { id: 'perplexity', label: 'Perplexity Pro', checked: true },
  { id: 'claude', label: 'Claude 3 Opus', checked: false },
];

export default function NewRunPage() {
  const router = useRouter();
  const [brandName, setBrandName] = useState('Pixis');
  const [brandDomain, setBrandDomain] = useState('pixis.ai');
  const [competitors, setCompetitors] = useState(['Albert.ai', 'Smartly.io']);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [engines, setEngines] = useState(defaultEngines);
  const [prompts, setPrompts] = useState([
    'Best AI platform for ad performance optimization',
    'Top tools for automating social media ad buying',
  ]);
  const [newPrompt, setNewPrompt] = useState('');

  const toggleEngine = (id: string) => {
    setEngines((prev) =>
      prev.map((e) => (e.id === id ? { ...e, checked: !e.checked } : e)),
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

  const handleSubmit = () => {
    // In demo mode, navigate directly to the progress page
    router.push('/runs/run-demo-001');
  };

  return (
    <PageTransition>
      <div className="pt-6 pb-16 px-page max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="mb-12 mt-8">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-display-lg mb-4"
            style={{ color: 'var(--primary)' }}
          >
            Run a visibility check
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
            className="text-body-lg max-w-2xl"
            style={{ color: 'var(--secondary)' }}
          >
            Configure your analysis parameters below to measure how frequently your brand appears
            alongside competitors across major AI language models.
          </motion.p>
        </header>

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
                    Brand Name
                  </label>
                  <input
                    className="input-editorial w-full text-body-lg"
                    type="text"
                    placeholder="e.g., Pixis"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
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
              {/* Analyst Note */}
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
                  Adding at least 3 competitors yields the most robust baseline comparison metrics.
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
                    placeholder="Add competitor..."
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
                Enter the natural language queries users might ask when researching this category.
              </p>
              <div className="space-y-6">
                {prompts.map((p, i) => (
                  <div key={i} className="relative">
                    <span
                      className="absolute left-0 top-3 text-sm font-display"
                      style={{ color: 'var(--secondary)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <textarea
                      className="input-editorial w-full pl-8 text-body-lg resize-none"
                      rows={2}
                      value={p}
                      onChange={(e) => {
                        const updated = [...prompts];
                        updated[i] = e.target.value;
                        setPrompts(updated);
                      }}
                    />
                  </div>
                ))}
                <div className="relative">
                  <span
                    className="absolute left-0 top-3 text-sm font-display"
                    style={{ color: 'var(--outline)' }}
                  >
                    {String(prompts.length + 1).padStart(2, '0')}
                  </span>
                  <textarea
                    className="input-editorial w-full pl-8 text-body-lg resize-none"
                    rows={2}
                    placeholder="Add another prompt..."
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
              className="pt-8 flex justify-end gap-4 border-t mt-12"
              style={{ borderColor: 'var(--outline-variant)' }}
            >
              <button
                type="button"
                className="px-8 py-4 rounded-full border text-label-caps transition-colors hover:opacity-70"
                style={{
                  borderColor: 'var(--outline-variant)',
                  color: 'var(--secondary)',
                }}
              >
                Save as Draft
              </button>
              <motion.button
                type="submit"
                whileHover={buttonHover}
                whileTap={buttonTap}
                className="px-8 py-4 rounded-full text-label-caps flex items-center gap-2 shadow-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--primary-container)',
                  color: 'var(--on-primary)',
                }}
              >
                Run analysis
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}
