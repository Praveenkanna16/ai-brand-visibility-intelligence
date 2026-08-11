'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/layout/ScrollReveal';
import StickyNote from '@/components/ui/StickyNote';
import { Radar, ArrowLeftRight, FileCheck, Share2 } from 'lucide-react';
import {
  heroHeadline, heroSubtext, heroCTA, heroVisual,
  scrollRevealStagger, scrollReveal, buttonHover, buttonTap,
} from '@/lib/animations/variants';

export default function LandingPage() {
  return (
    <div className="pb-16">
      {/* ─── Hero Section ─── */}
      <section className="pt-12 pb-16 px-page max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-24">
          {/* Hero Text */}
          <div className="md:col-span-6 flex flex-col justify-center">
            <motion.h1
              variants={heroHeadline}
              initial="hidden"
              animate="visible"
              className="text-display-lg mb-6"
              style={{ color: 'var(--primary)' }}
            >
              Is AI recommending you — or your competitor?
            </motion.h1>
            <motion.p
              variants={heroSubtext}
              initial="hidden"
              animate="visible"
              className="text-body-lg mb-10 max-w-lg"
              style={{ color: 'var(--secondary)' }}
            >
              Discover your true visibility across AI platforms. Identify critical
              gaps in your narrative and reclaim your market authority.
            </motion.p>
            <motion.div
              variants={heroCTA}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-4"
            >
              <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                <Link
                  href="/runs/new"
                  className="inline-block px-8 py-4 rounded-lg text-label-caps font-bold transition-colors"
                  style={{
                    backgroundColor: 'var(--primary-container)',
                    color: 'var(--on-primary)',
                  }}
                >
                  Get Started
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Hero Visual / Bento Grid */}
          <motion.div
            variants={heroVisual}
            initial="hidden"
            animate="visible"
            className="md:col-span-6 relative h-[500px] hidden md:block"
          >
            {/* Visibility Gap Card */}
            <div
              className="absolute top-10 right-10 rounded-xl border p-6 w-72 ambient-shadow z-10 rotate-slight-pos"
              style={{
                backgroundColor: 'var(--surface-container-lowest)',
                borderColor: 'var(--surface-variant)',
              }}
            >
              <h3 className="text-headline-sm mb-2" style={{ color: 'var(--primary)' }}>
                Visibility Gap
              </h3>
              <div
                className="h-2 w-full rounded-full overflow-hidden mb-4"
                style={{ backgroundColor: 'var(--surface-container)' }}
              >
                <div className="h-full w-[65%]" style={{ backgroundColor: 'var(--error-container)' }} />
              </div>
              <div className="flex justify-between text-label-caps" style={{ color: 'var(--secondary)' }}>
                <span>Your Brand: 35%</span>
                <span>Competitors: 65%</span>
              </div>
            </div>

            {/* AI Answer Engines Card */}
            <div
              className="absolute bottom-20 left-4 rounded-xl border p-6 w-80 ambient-shadow z-20"
              style={{
                backgroundColor: 'var(--surface-container-lowest)',
                borderColor: 'var(--surface-variant)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Share2 size={20} style={{ color: 'var(--primary-container)' }} />
                <h4 className="text-label-caps font-bold" style={{ color: 'var(--primary)' }}>
                  AI Answer Engines
                </h4>
              </div>
              <p className="text-body-md" style={{ color: 'var(--secondary)' }}>
                Analyzing millions of AI responses to map the exact pathways to your brand.
              </p>
            </div>

            {/* Sticky Notes */}
            <StickyNote color="mustard" rotation="neg" className="absolute top-0 left-10 w-40 z-30">
              <span className="text-label-caps font-bold" style={{ color: 'var(--on-tertiary-fixed-variant)' }}>
                AI Visibility
              </span>
            </StickyNote>

            <StickyNote color="blush" rotation="pos" className="absolute top-48 right-0 w-48 z-30">
              <span className="text-label-caps font-bold" style={{ color: 'var(--on-error-container)' }}>
                Competitive Gaps
              </span>
            </StickyNote>

            <StickyNote color="sage" rotation="neg" className="absolute bottom-10 right-20 w-44 z-30">
              <span className="text-label-caps font-bold" style={{ color: 'var(--on-primary-fixed-variant)' }}>
                Actionable Briefs
              </span>
            </StickyNote>
          </motion.div>
        </div>

        {/* ─── The Complete Visibility Loop ─── */}
        <ScrollReveal>
          <section
            id="how-it-works"
            className="rounded-[32px] p-12 md:p-20 ambient-shadow border scroll-mt-24"
            style={{
              backgroundColor: 'var(--surface-container-lowest)',
              borderColor: 'var(--surface-variant)',
            }}
          >
            <h2
              className="text-headline-md mb-16 text-center max-w-2xl mx-auto"
              style={{ color: 'var(--primary)' }}
            >
              The Complete Visibility Loop
            </h2>

            <motion.div
              variants={scrollRevealStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {/* Card 1: Detect */}
              <motion.div
                variants={scrollReveal}
                className="rounded-xl p-8 border flex flex-col relative overflow-hidden group"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--surface-variant)',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'rgba(248, 189, 75, 0.2)' }}
                />
                <span className="text-metric-num mb-4" style={{ color: 'var(--secondary-fixed-dim)' }}>
                  01
                </span>
                <h3 className="text-headline-sm mb-3" style={{ color: 'var(--primary)' }}>
                  Detect
                </h3>
                <p className="text-body-md flex-grow mb-8" style={{ color: 'var(--secondary)' }}>
                  Continuous monitoring of AI recommendation engines to capture emerging signals.
                </p>
                <div
                  className="h-32 rounded-lg border flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(248, 189, 75, 0.2)',
                    borderColor: 'rgba(248, 189, 75, 0.3)',
                  }}
                >
                  <Radar size={48} style={{ color: 'var(--on-tertiary-fixed-variant)' }} />
                </div>
              </motion.div>

              {/* Card 2: Understand */}
              <motion.div
                variants={scrollReveal}
                className="rounded-xl p-8 border flex flex-col relative overflow-hidden group"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--surface-variant)',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'rgba(192, 236, 217, 0.2)' }}
                />
                <span className="text-metric-num mb-4" style={{ color: 'var(--secondary-fixed-dim)' }}>
                  02
                </span>
                <h3 className="text-headline-sm mb-3" style={{ color: 'var(--primary)' }}>
                  Understand
                </h3>
                <p className="text-body-md flex-grow mb-8" style={{ color: 'var(--secondary)' }}>
                  Deep semantic analysis maps your narrative against key competitor positions.
                </p>
                <div
                  className="h-32 rounded-lg border flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(192, 236, 217, 0.3)',
                    borderColor: 'rgba(192, 236, 217, 0.4)',
                  }}
                >
                  <ArrowLeftRight size={48} style={{ color: 'var(--on-primary-fixed-variant)' }} />
                </div>
              </motion.div>

              {/* Card 3: Act */}
              <motion.div
                variants={scrollReveal}
                className="rounded-xl p-8 border flex flex-col relative overflow-hidden group"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--surface-variant)',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'rgba(165, 208, 190, 0.2)' }}
                />
                <span className="text-metric-num mb-4" style={{ color: 'var(--secondary-fixed-dim)' }}>
                  03
                </span>
                <h3 className="text-headline-sm mb-3" style={{ color: 'var(--primary)' }}>
                  Act
                </h3>
                <p className="text-body-md flex-grow mb-8" style={{ color: 'var(--secondary)' }}>
                  Generated strategic briefs designed to seamlessly insert you into AI discourse.
                </p>
                <div
                  className="h-32 rounded-lg border flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(165, 208, 190, 0.3)',
                    borderColor: 'rgba(165, 208, 190, 0.4)',
                  }}
                >
                  <FileCheck size={48} style={{ color: 'var(--primary-container)' }} />
                </div>
              </motion.div>
            </motion.div>
          </section>
        </ScrollReveal>
      </section>
    </div>
  );
}
