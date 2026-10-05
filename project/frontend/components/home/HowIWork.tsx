import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { Reveal } from '@/components/foundation/Reveal';

/**
 * Process steps (Section 6.1, Section 6), grounded in the résumé: "Own
 * features from requirement to production".
 */
const steps = [
  {
    title: 'Understand',
    body: 'Gather requirements with clients and stakeholders, then turn them into a plan developers can build from.',
  },
  {
    title: 'Model',
    body: 'Design the database schema and API contracts first, so everything built on top stays consistent.',
  },
  {
    title: 'Build',
    body: 'Backend, frontend and integrations, reviewed, tested and documented.',
  },
  {
    title: 'Ship & improve',
    body: 'Deploy, monitor, fix and optimise, and report progress directly to clients.',
  },
];

/**
 * How I Work (Section 6.1, Section 6): numbered rows with 1px dividers — the
 * mono number on the left, the title in `h3`, the description in `body-s`.
 * The number lights up in the accent on hover.
 */
export function HowIWork() {
  return (
    <Section id="process" aria-labelledby="process-heading">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <SectionLabel number="04" title="Process" />
          <div id="process-heading">
            <EmphasisHeading level={2} className="text-display-l">
              From requirement to [production].
            </EmphasisHeading>
          </div>
        </div>

        <ol className="border-b border-border">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t border-border">
              <Reveal delay={index * 0.06}>
                <div className="group grid grid-cols-[3rem_1fr] gap-x-4 gap-y-2 py-8 md:grid-cols-12 md:items-baseline md:gap-6">
                  <span className="font-mono text-label text-text-subtle transition-colors ease-out [transition-duration:var(--dur-base)] group-hover:text-accent-text md:col-span-1">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-h3 text-text md:col-span-4">
                    {step.title}
                  </h3>
                  <p className="col-start-2 max-w-[52ch] text-body-s text-text-muted md:col-span-7 md:col-start-auto">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
