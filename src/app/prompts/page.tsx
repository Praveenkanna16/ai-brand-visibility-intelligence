'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import { demoRunResults } from '@/lib/demo/data';
import { Search, Filter, ChevronRight, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { fadeInUp, tableRowEntrance, cardStagger } from '@/lib/animations/variants';

export default function PromptsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredResults = demoRunResults.filter((r) => {
    const matchesSearch =
      r.prompt?.text.toLowerCase().includes(search.toLowerCase()) ||
      r.engine?.displayName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'GAP' && r.status?.includes('gap')) ||
      (statusFilter === 'FAVORABLE' && r.status === 'favorable');
    return matchesSearch && matchesStatus;
  });

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
            Prompt Intelligence
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
                  <th className="py-4 px-6 text-right font-bold">Action</th>
                </tr>
              </thead>
              <motion.tbody
                variants={cardStagger}
                initial="hidden"
                animate="visible"
                className="divide-y"
                style={{ borderColor: 'var(--outline-variant)' }}
              >
                {filteredResults.map((r) => (
                  <motion.tr
                    key={r.id}
                    variants={tableRowEntrance}
                    className="hover:bg-[var(--surface-container-low)] transition-colors group cursor-pointer"
                  >
                    <td className="py-5 px-6 font-body font-medium text-body-md" style={{ color: 'var(--primary)' }}>
                      <Link href={`/prompts/${r.id}`} className="hover:underline block">
                        {r.prompt?.text}
                      </Link>
                    </td>
                    <td className="py-5 px-4 font-body text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: r.engine?.color || '#123c2f' }}
                        />
                        {r.engine?.displayName}
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
                          {r.competitorsMentioned.map((c) => (
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
                        href={`/prompts/${r.id}`}
                        className="inline-flex items-center gap-1 text-label-caps font-bold transition-transform group-hover:translate-x-1"
                        style={{ color: 'var(--primary-container)' }}
                      >
                        Investigate <ChevronRight size={14} />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
