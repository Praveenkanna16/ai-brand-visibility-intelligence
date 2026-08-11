'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import { Search, Filter, ChevronRight, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { fadeInUp, tableRowEntrance, cardStagger } from '@/lib/animations/variants';

export default function PromptsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPromptsData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/prompts');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError('Failed to load prompt intelligence.');
        }
      } catch (err) {
        console.error('Error loading prompts data:', err);
        setError('Unable to connect to CiteScope server.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPromptsData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin mb-4" />
        <p className="text-body-md text-emerald-900 font-medium">Loading prompt intelligence matrix...</p>
      </div>
    );
  }

  const results: any[] = data?.results || [];

  const filteredResults = results.filter((r) => {
    const promptText = r.prompt?.text || r.promptText || '';
    const engineName = r.engine?.displayName || r.engineName || '';
    const matchesSearch =
      promptText.toLowerCase().includes(search.toLowerCase()) ||
      engineName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'GAP' && !r.mentioned) ||
      (statusFilter === 'FAVORABLE' && r.mentioned);

    return matchesSearch && matchesStatus;
  });

  if (error || !data || results.length === 0) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-page py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-display-md mb-4 text-slate-900 font-display">
            No Prompt Execution Data
          </h1>
          <p className="text-body-lg text-slate-600 max-w-xl mx-auto mb-8">
            Run a live analysis to see prompt-by-prompt execution details, entity mentions, and position rankings.
          </p>
          <Link
            href="/runs/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-800 text-white font-semibold uppercase tracking-wider text-xs shadow-md hover:bg-emerald-900 transition-colors"
          >
            <Zap size={16} className="text-yellow-300 fill-yellow-300" />
            Run Live Analysis
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-page py-16">
        {/* Header */}
        <header className="mb-10">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-display-lg mb-3"
            style={{ color: 'var(--primary)' }}
          >
            Prompt Intelligence Matrix
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-body-lg max-w-2xl"
            style={{ color: 'var(--secondary)' }}
          >
            Detailed analysis matrix of natural language category queries and how AI models cite your brand versus competitors.
          </motion.p>
        </header>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--outline)' }}
            />
            <input
              type="text"
              placeholder="Search prompts or engines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full border text-body-md focus:outline-none"
              style={{
                backgroundColor: 'var(--surface-container-lowest)',
                borderColor: 'var(--outline-variant)',
                color: 'var(--on-surface)',
              }}
            />
          </div>

          <div className="flex items-center gap-2 text-label-caps self-start md:self-auto">
            <Filter size={14} style={{ color: 'var(--secondary)' }} />
            {['ALL', 'GAP', 'FAVORABLE'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  statusFilter === f ? 'font-bold' : ''
                }`}
                style={{
                  backgroundColor:
                    statusFilter === f ? 'var(--primary-container)' : 'var(--surface-container)',
                  color: statusFilter === f ? 'var(--on-primary)' : 'var(--secondary)',
                  borderColor:
                    statusFilter === f ? 'var(--primary-container)' : 'var(--outline-variant)',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Table */}
        <div className="bento-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="border-b text-label-caps"
                  style={{
                    backgroundColor: 'var(--surface-container-low)',
                    borderColor: 'var(--outline-variant)',
                    color: 'var(--secondary)',
                  }}
                >
                  <th className="py-4 px-6 font-bold">Category Prompt</th>
                  <th className="py-4 px-4 font-bold">AI Engine</th>
                  <th className="py-4 px-4 font-bold">Mention Status</th>
                  <th className="py-4 px-4 font-bold">Position</th>
                  <th className="py-4 px-4 font-bold">Competitors Mentioned</th>
                  <th className="py-4 px-6 text-right font-bold">Run Report</th>
                </tr>
              </thead>
              <motion.tbody
                variants={cardStagger}
                initial="hidden"
                animate="visible"
                className="divide-y"
                style={{ borderColor: 'var(--outline-variant)' }}
              >
                {filteredResults.map((r) => {
                  const promptText = r.prompt?.text || r.promptText || 'Prompt Query';
                  const engineDisplayName = r.engine?.displayName || r.engineName || 'Gemini';
                  const engineColor = r.engine?.color || '#8E75B2';

                  return (
                    <motion.tr
                      key={r.id}
                      variants={tableRowEntrance}
                      className="hover:bg-[var(--surface-container-low)] transition-colors group cursor-pointer"
                    >
                      <td className="py-5 px-6 font-body font-medium text-body-md" style={{ color: 'var(--primary)' }}>
                        <Link href={`/runs/${r.runId}`} className="hover:underline block">
                          "{promptText}"
                        </Link>
                      </td>
                      <td className="py-5 px-4 font-body text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: engineColor }}
                          />
                          {engineDisplayName}
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        {r.mentioned ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-caps"
                            style={{
                              backgroundColor: 'rgba(192, 236, 217, 0.4)',
                              color: 'var(--on-primary-fixed-variant)',
                            }}
                          >
                            <CheckCircle size={14} /> Mentioned
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-caps"
                            style={{
                              backgroundColor: 'var(--error-container)',
                              color: 'var(--on-error-container)',
                            }}
                          >
                            <AlertCircle size={14} /> Gap Detected
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-4 font-display font-bold text-headline-sm" style={{ color: 'var(--primary)' }}>
                        {r.position ? `#${r.position}` : '—'}
                      </td>
                      <td className="py-5 px-4 font-body text-body-md" style={{ color: 'var(--secondary)' }}>
                        {r.competitorsMentioned && r.competitorsMentioned.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {r.competitorsMentioned.map((c: string) => (
                              <span
                                key={c}
                                className="px-2.5 py-0.5 rounded-md text-xs font-medium border"
                                style={{
                                  backgroundColor: 'var(--surface-container)',
                                  borderColor: 'var(--outline-variant)',
                                  color: 'var(--on-surface-variant)',
                                }}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-outline">None</span>
                        )}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <Link
                          href={`/runs/${r.runId}`}
                          className="inline-flex items-center gap-1 text-label-caps font-bold transition-transform group-hover:translate-x-1"
                          style={{ color: 'var(--primary-container)' }}
                        >
                          View Report <ChevronRight size={14} />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
