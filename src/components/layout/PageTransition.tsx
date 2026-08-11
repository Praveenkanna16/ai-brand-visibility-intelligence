'use client';

import { motion } from 'framer-motion';
import { pageTransition, pageTransitionConfig } from '@/lib/animations/variants';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransitionConfig}
    >
      {children}
    </motion.div>
  );
}
