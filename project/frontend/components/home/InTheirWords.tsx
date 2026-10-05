import { profile } from '@/content/profile';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { QuoteColumns } from '@/components/ui/quote-columns';

export function InTheirWords() {
  if (profile.testimonials.length === 0) return null;

  return (
    <Section id="words" aria-labelledby="words-heading">
      <Container className="flex flex-col gap-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <SectionLabel number="06" title="In their words" />
          <div id="words-heading">
            <EmphasisHeading level={2} className="text-display-l">
              What working with me is [like].
            </EmphasisHeading>
          </div>
        </div>
        <QuoteColumns items={profile.testimonials} />
      </Container>
    </Section>
  );
}
