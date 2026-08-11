'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { navEntrance, buttonHover, buttonTap } from '@/lib/animations/variants';

const navLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard', label: 'Visibility' },
  { href: '/prompts', label: 'Prompts' },
  { href: '/competitors', label: 'Competitors' },
  { href: '/insights/insight-001', label: 'Insights' },
  { href: '/settings', label: 'Settings' },
];

const landingNavLinks = [
  { href: '/dashboard', label: 'Product' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '/insights/insight-001', label: 'Insights' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const links = isLanding ? landingNavLinks : navLinks;

  return (
    <motion.nav
      variants={navEntrance}
      initial="hidden"
      animate="visible"
      className="fixed top-0 w-full z-50 backdrop-blur-md shadow-sm"
      style={{ backgroundColor: 'rgba(252, 249, 243, 0.9)' }}
    >
      <div className="flex justify-between items-center px-page py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-headline-md tracking-tight font-bold" style={{ color: 'var(--primary)' }}>
            CiteScope
          </Link>

          {/* Nav Links — Desktop */}
          <div className="hidden md:flex gap-6 items-center">
            {links.map((link) => {
              const isActive = !isLanding && pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-label-caps pb-1 transition-colors duration-200 ${
                    isActive ? 'nav-link-active font-bold' : 'hover:opacity-70'
                  }`}
                  style={{ color: isActive ? 'var(--primary)' : 'var(--secondary)' }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {isLanding && (
            <Link
              href="/dashboard"
              className="text-label-caps hidden md:block transition-colors duration-200 hover:opacity-70 font-medium"
              style={{ color: 'var(--secondary)' }}
            >
              Sign in
            </Link>
          )}

          <motion.div whileHover={buttonHover} whileTap={buttonTap}>
            <Link
              href="/runs/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-label-caps font-bold transition-colors shadow-sm"
              style={{
                backgroundColor: 'var(--primary-container)',
                color: 'var(--on-primary)',
              }}
            >
              {isLanding ? 'Run a visibility check' : 'Run Analysis'}
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
