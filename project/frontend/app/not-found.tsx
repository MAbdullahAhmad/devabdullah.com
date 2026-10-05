import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { MissingQuery } from '@/components/global/MissingQuery';
import { CommandMenuHint } from '@/components/global/CommandMenuHint';

const destinations = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'Contact', href: '/contact' },
];

/** 404 — "row not found" (Section 6.8). Handles every unmatched URL. */
export default function NotFound() {
  return (
    <div className="pb-16 pt-32 md:pt-40">
      <Container className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="hero-rise flex flex-col gap-6 lg:col-span-5">
          <SectionLabel number="404" title="Row not found" />
          <EmphasisHeading level={1} className="text-display-l">
            That page doesn&apos;t [exist].
          </EmphasisHeading>
          <p className="text-body-l text-text-muted">Maybe one of these?</p>
          <ul className="flex flex-col border-b border-border">
            {destinations.map((destination) => (
              <li key={destination.href} className="border-t border-border">
                <Link
                  href={destination.href}
                  className="group flex items-center justify-between py-4 text-h4 text-text transition-colors hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {destination.label}
                  <ArrowRight
                    size={18}
                    strokeWidth={1.5}
                    aria-hidden
                    className="text-text-muted transition-transform ease-out [transition-duration:var(--dur-base)] group-hover:translate-x-1 group-hover:text-accent-text"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-body-s text-text-subtle">
            Or search everything:{' '}
            <CommandMenuHint className="text-text-muted" />
          </p>
        </div>

        <div
          className="hero-rise lg:col-span-6 lg:col-start-7"
          style={{ animationDelay: '120ms' }}
        >
          <MissingQuery />
        </div>
      </Container>
    </div>
  );
}
