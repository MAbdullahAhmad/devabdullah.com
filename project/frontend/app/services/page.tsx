import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { services } from '@/content/services';
import { Container } from '@/components/layout/Container';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { Button } from '@/components/foundation/Button';
import { TechPath } from '@/components/foundation/TechPath';
import { ServiceIcon } from '@/components/services/ServiceIcon';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Services for Abdullah Ahmad will be added as verified capabilities are provided.',
  alternates: { canonical: '/services' },
};

/**
 * Services (owner change OC.3): an index, then one section per service with
 * what it covers, the usual stack and — where one exists — a case study.
 */
export default function ServicesPage() {
  return (
    <div className="pb-8 pt-32 md:pt-40">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="hero-rise flex flex-col gap-6 lg:col-span-7">
          <SectionLabel title="Services" />
          <EmphasisHeading level={1} className="text-display-xl">
            Services, [coming next].
          </EmphasisHeading>
          <p className="max-w-[52ch] text-pretty text-body-l text-text-muted">
            This route is ready for Abdullah’s real service offering. No
            inherited claims are published.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/book-a-call" variant="primary" size="lg">
              Book a call
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Send a message
            </Button>
          </div>
        </div>

        <nav
          aria-label="Services"
          className="hero-rise self-end lg:col-span-4 lg:col-start-9"
          style={{ animationDelay: '120ms' }}
        >
          <ol className="border-b border-border">
            {services.map((service, index) => (
              <li key={service.slug} className="border-t border-border">
                <a
                  href={`#${service.slug}`}
                  className="group flex items-center gap-4 py-3 text-body-s text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="font-mono text-label text-text-subtle group-hover:text-accent-text">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {service.title}
                  <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    aria-hidden
                    className="ml-auto -translate-x-1 opacity-0 transition ease-out [transition-duration:var(--dur-base)] group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </Container>

      <Container className="mt-24 flex flex-col md:mt-32">
        {services.map((service, index) => (
          <section
            key={service.slug}
            id={service.slug}
            aria-labelledby={`${service.slug}-title`}
            className="group grid scroll-mt-28 gap-8 border-t border-border py-16 lg:grid-cols-12 lg:gap-8"
          >
            <div
              data-reveal="up"
              className="flex flex-col gap-5 lg:sticky lg:top-28 lg:col-span-5 lg:self-start"
            >
              <div className="flex items-center gap-4">
                <ServiceIcon name={service.icon} />
                <span className="font-mono text-label text-text-subtle">
                  {String(index + 1).padStart(2, '0')} /{' '}
                  {String(services.length).padStart(2, '0')}
                </span>
              </div>
              <h2
                id={`${service.slug}-title`}
                className="text-balance text-display-m font-semibold text-text"
              >
                {service.title}
              </h2>
              <p className="max-w-[40ch] text-body text-text-muted">
                {service.summary}
              </p>
            </div>

            <div
              data-reveal="up"
              style={{ '--reveal-delay': '0.12s' } as CSSProperties}
              className="flex flex-col gap-10 lg:col-span-6 lg:col-start-7"
            >
              <p className="text-pretty text-body-l text-text">
                {service.description}
              </p>

              <div className="flex flex-col gap-4">
                <h3 className="font-mono text-label text-text-subtle">
                  What&apos;s included
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {service.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-body-s text-text-muted"
                    >
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-pill bg-accent-soft text-accent-text">
                        <Check size={12} strokeWidth={2} aria-hidden />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-label text-text-subtle">
                    Usual stack
                  </span>
                  <TechPath items={service.stack} />
                </div>
                {service.proof && (
                  <Link
                    href={service.proof.href}
                    className="group/proof inline-flex items-center gap-1.5 text-body-s text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2"
                  >
                    See it in practice: {service.proof.label}
                    <ArrowUpRight
                      size={14}
                      strokeWidth={1.5}
                      aria-hidden
                      className="transition-transform group-hover/proof:-translate-y-0.5 group-hover/proof:translate-x-0.5"
                    />
                  </Link>
                )}
              </div>
            </div>
          </section>
        ))}
      </Container>

      <Container className="mt-8">
        <div
          data-reveal="scale"
          data-spotlight
          className="relative isolate flex flex-col items-start gap-8 overflow-hidden rounded-lg border border-border bg-bg-elevated p-8 md:flex-row md:items-center md:justify-between md:p-12"
        >
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(80%_120%_at_100%_0%,var(--accent-soft),transparent_60%)]"
          />
          <div className="flex max-w-[36rem] flex-col gap-3">
            <EmphasisHeading level={2} className="text-display-m">
              Have a system in [mind]?
            </EmphasisHeading>
            <p className="text-body text-text-muted">
              A short call is the quickest way to see whether I&apos;m the right
              fit. No preparation needed — bring the problem.
            </p>
          </div>
          <Button href="/book-a-call" variant="primary" size="lg">
            Book a call
          </Button>
        </div>
      </Container>
    </div>
  );
}
