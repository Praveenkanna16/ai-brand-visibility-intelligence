import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      className="w-full rounded-t-xl border-t mt-16"
      style={{
        backgroundColor: 'var(--surface-container-lowest)',
        borderColor: 'var(--outline-variant)',
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center px-page py-12 max-w-7xl mx-auto gap-6">
        <span className="text-headline-sm font-bold" style={{ color: 'var(--primary)' }}>
          CiteScope
        </span>

        <div className="flex flex-wrap justify-center gap-6">
          {['Privacy Policy', 'Terms of Service', 'API Documentation', 'Support'].map((label) => (
            <Link
              key={label}
              href="#"
              className="text-body-md underline transition-colors hover:opacity-70"
              style={{ color: 'var(--secondary)' }}
            >
              {label}
            </Link>
          ))}
        </div>

        <span className="text-body-md" style={{ color: 'var(--secondary)' }}>
          © 2024 CiteScope Intelligence. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
