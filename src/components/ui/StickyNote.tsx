'use client';

import { motion } from 'framer-motion';
import { stickyNoteEntrance, stickyNoteHover } from '@/lib/animations/variants';

type NoteColor = 'mustard' | 'blush' | 'sage' | 'pale-blue';
type Rotation = 'pos' | 'neg' | 'slight-pos' | 'slight-neg' | 'none';

interface StickyNoteProps {
  children: React.ReactNode;
  color?: NoteColor;
  rotation?: Rotation;
  className?: string;
  label?: string;
  labelIcon?: React.ReactNode;
}

const colorMap: Record<NoteColor, { bg: string; text: string; label: string }> = {
  mustard: { bg: 'var(--mustard)', text: '#271900', label: '#5e4200' },
  blush: { bg: 'var(--blush)', text: '#93000a', label: '#93000a' },
  sage: { bg: 'var(--sage)', text: '#002117', label: '#264e40' },
  'pale-blue': { bg: 'var(--pale-blue)', text: '#002117', label: '#264e40' },
};

const rotationMap: Record<Rotation, string> = {
  pos: 'rotate-pos',
  neg: 'rotate-neg',
  'slight-pos': 'rotate-slight-pos',
  'slight-neg': 'rotate-slight-neg',
  none: '',
};

export default function StickyNote({
  children,
  color = 'mustard',
  rotation = 'pos',
  className = '',
  label,
  labelIcon,
}: StickyNoteProps) {
  const colors = colorMap[color];
  const rotClass = rotationMap[rotation];

  return (
    <motion.div
      variants={stickyNoteEntrance}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      whileHover={stickyNoteHover}
      className={`sticky-note p-6 ${rotClass} ${className}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {label && (
        <div className="flex items-center gap-2 mb-4" style={{ color: colors.label }}>
          {labelIcon}
          <span className="text-label-caps font-bold tracking-widest">{label}</span>
        </div>
      )}
      {children}
    </motion.div>
  );
}
