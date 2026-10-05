import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { services } from '@/content/services';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { Button } from '@/components/foundation/Button';
import { Reveal } from '@/components/foundation/Reveal';
import { ServiceCard } from '@/components/services/ServiceCard';

/** Services (owner change OC.3): the offer, first thing after the proof strip. */
export function ServicesSection() {
  return (
    <Section id="services" aria-labelledby="services-heading">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-[40rem] flex-col gap-4">
            <SectionLabel number="01" title="Services" />
            <div id="services-heading">
              <EmphasisHeading level={2} className="text-display-l">
                What I can [build] for you.
              </EmphasisHeading>
            </div>
            <p className="max-w-[52ch] text-pretty text-body text-text-muted">
              SaaS products, CMS platforms, ERPs and the databases behind them —
              designed carefully, built to last and handed over documented.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/book-a-call" variant="primary">
              Book a call
            </Button>
            <Button href="/services" variant="secondary">
              All services
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
            </Button>
          </div>
        </div>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <li key={service.slug}>
              <Reveal delay={(index % 3) * 0.06} className="h-full">
                <ServiceCard service={service} index={index} />
              </Reveal>
            </li>
          ))}
        </ul>

        <p className="text-body-s text-text-muted">
          Not sure which fits?{' '}
          <Link
            href="/contact"
            className="text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            Describe the problem
          </Link>{' '}
          and I&apos;ll suggest where to start.
        </p>
      </Container>
    </Section>
  );
}
