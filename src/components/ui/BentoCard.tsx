'use client';

import { motion } from 'framer-motion';
import { cardEntrance } from '@/lib/animations/variants';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
  borderColor?: string;
  padding?: string;
  animate?: boolean;
}

export default function BentoCard({
  children,
  className = '',
  bgColor,
  borderColor,
  padding = 'p-8',
  animate = true,
}: BentoCardProps) {
  const Component = animate ? motion.div : 'div';
  const animProps = animate
    ? {
        variants: cardEntrance,
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport: { once: true, margin: '-40px' },
      }
    : {};

  return (
    <Component
      className={`bento-card ${padding} ${className}`}
      style={{
        ...(bgColor && { backgroundColor: bgColor }),
        ...(borderColor && { borderColor }),
      }}
      {...animProps}
    >
      {children}
    </Component>
  );
}
