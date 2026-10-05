import type { CSSProperties } from 'react';
import { profile } from '@/content/profile';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';

/** Plus that becomes a minus: the vertical stroke rotates flat when open. */
function PlusMinus() {
  return (
    <span className="relative size-4 shrink-0" aria-hidden>
      <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
      <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current transition-transform ease-out [transition-duration:var(--dur-base)] group-open/faq:rotate-90" />
    </span>
  );
}

/**
 * Things people ask (Section 6.1, Section 9). Native `<details>` sharing one
 * `name`, so only one answer is open at a time — keyboard accessible, readable
 * without JavaScript and searchable with find-in-page. 1px dividers, `h4`
 * questions and a plus/minus icon. Answers come from `profile.faq`.
 */
export function FaqAccordion() {
  if (profile.faq.length === 0) return null;
  return (
    <Section id="faq" aria-labelledby="faq-heading">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <SectionLabel number="07" title="FAQ" />
          <div id="faq-heading">
            <EmphasisHeading level={2} className="text-display-l">
              Things people [ask] me.
            </EmphasisHeading>
          </div>
        </div>

        <div className="border-b border-border lg:col-span-7">
          {profile.faq.map((item, index) => (
            <details
              key={item.question}
              data-reveal="up"
              style={{ '--reveal-delay': `${index * 0.06}s` } as CSSProperties}
              name="faq"
              className="disclosure group/faq border-t border-border"
            >
              <summary className="flex items-center justify-between gap-6 rounded-md py-6 text-left text-text transition-colors hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent group-open/faq:text-accent-text">
                <h3 className="text-h4">{item.question}</h3>
                <PlusMinus />
              </summary>
              <div className="flex max-w-[60ch] flex-col gap-3 pb-6 text-body-s text-text-muted">
                <p>{item.answer}</p>
                {item.links && (
                  <p className="flex flex-wrap gap-4">
                    {item.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body-s text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2"
                      >
                        {link.label}
                      </a>
                    ))}
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
