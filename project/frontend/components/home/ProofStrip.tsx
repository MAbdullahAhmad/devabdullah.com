import type { CSSProperties } from 'react';

import { Container } from '@/components/layout/Container';

const stats = [
  { text: 'Next.js', label: 'Frontend application' },
  { text: '/api/*', label: 'Backend route reserved' },
  { text: ':4000', label: 'Local reverse proxy' },
  { text: 'V1', label: 'Portfolio foundation' },
];

export function ProofStrip() {
  return (
    <section aria-label="Project setup" className="border-y border-border">
      <Container className="px-0">
        <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              data-reveal="up"
              style={{ '--reveal-delay': `${index * 0.08}s` } as CSSProperties}
              className="flex flex-col gap-2 bg-bg px-[var(--page-padding-x)] py-10 md:px-8"
            >
              <span className="text-display-m tabular-nums text-text">
                {stat.text}
              </span>
              <span className="text-body-s text-text-muted">{stat.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
