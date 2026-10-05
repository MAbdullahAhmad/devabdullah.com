import { Mail } from 'lucide-react';

import { profile } from '@/content/profile';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { Button } from '@/components/foundation/Button';
import { CopyEmail } from '@/components/home/CopyEmail';

export function ContactBlock() {
  const { email } = profile.contact;

  return (
    <Section id="contact" aria-labelledby="contact-heading">
      <Container>
        <div
          data-reveal="up"
          className="flex flex-col gap-10 border-t border-border pt-16"
        >
          <div className="flex flex-col gap-4">
            <SectionLabel number="02" title="Contact" />
            <div id="contact-heading">
              <EmphasisHeading
                level={2}
                className="max-w-[14ch] text-display-l"
              >
                The next details are [yours].
              </EmphasisHeading>
            </div>
            <p className="max-w-[48ch] text-pretty text-body-l text-text-muted">
              Projects, experience, skills and final contact links can be added
              without changing the site architecture.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
            <a
              href={`mailto:${email}`}
              className="break-all text-h3 text-text underline decoration-border-strong decoration-1 underline-offset-8 transition-colors hover:decoration-accent md:text-display-m md:break-normal"
            >
              {email}
            </a>
            <CopyEmail email={email} />
          </div>

          <Button href={`mailto:${email}`} variant="primary" size="lg">
            <Mail size={18} strokeWidth={1.5} aria-hidden />
            Email
          </Button>
        </div>
      </Container>
    </Section>
  );
}
