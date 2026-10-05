import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { profile } from '@/content/profile';
import { services } from '@/content/services';
import { Container } from '@/components/layout/Container';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { BookingScheduler } from '@/components/booking/BookingScheduler';

export const metadata: Metadata = {
  title: 'Book a call',
  description:
    'Request a time to speak with Abdullah Ahmad. Scheduling details can be refined when availability is confirmed.',
  alternates: { canonical: '/book-a-call' },
};

const steps = [
  {
    title: 'Pick a time',
    body: 'Choose the kind of call and a slot — times are shown in your own time zone.',
  },
  {
    title: 'I confirm by email',
    body: 'You get a reply with a meeting link, or a suggested alternative if that time no longer works.',
  },
  {
    title: 'We talk',
    body: 'No preparation needed. Bring the problem; we will work out the next step together.',
  },
];

/** Book a call (owner change OC.4). */
export default function BookACallPage() {
  const { email } = profile.contact;

  return (
    <div className="pb-8 pt-32 md:pt-40">
      <Container className="flex flex-col gap-10 md:gap-14">
        <div className="hero-rise flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="flex flex-col gap-5">
            <SectionLabel title="Book a call" />
            <EmphasisHeading level={1} className="max-w-[16ch] text-display-l">
              Let&apos;s [talk] about your system.
            </EmphasisHeading>
          </div>
          <p className="max-w-[38ch] text-pretty text-body-l text-text-muted md:pb-2">
            A short call is the quickest way to see whether I&apos;m the right
            fit for what you&apos;re building.
          </p>
        </div>

        <div className="hero-rise" style={{ animationDelay: '120ms' }}>
          <BookingScheduler
            name={profile.name}
            portrait={profile.portrait}
            services={services.map(({ slug, title }) => ({ slug, title }))}
          />
          <noscript>
            <p className="mt-4 text-body-s text-text-muted">
              The scheduler needs JavaScript. You can email{' '}
              <a
                className="text-accent-text underline"
                href={`mailto:${email}`}
              >
                {email}
              </a>{' '}
              with a few times that suit you instead.
            </p>
          </noscript>
        </div>

        <ol className="grid gap-8 border-t border-border pt-10 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              data-reveal="up"
              style={{ '--reveal-delay': `${index * 0.1}s` } as CSSProperties}
              className="flex flex-col gap-2"
            >
              <span className="font-mono text-label text-accent-text">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className="text-h4 text-text">{step.title}</h2>
              <p className="max-w-[36ch] text-body-s text-text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <p className="text-body-s text-text-muted">
          Prefer writing?{' '}
          <Link
            href="/contact"
            className="text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            Send a message
          </Link>{' '}
          or email{' '}
          <a
            href={`mailto:${email}`}
            className="text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {email}
          </a>
          .
        </p>
      </Container>
    </div>
  );
}
