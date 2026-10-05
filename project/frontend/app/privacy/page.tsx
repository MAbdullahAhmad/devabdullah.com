import type { Metadata } from 'next';
import Link from 'next/link';
import { profile } from '@/content/profile';
import { Container } from '@/components/layout/Container';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What this site collects, why, and what happens to it — in plain language.',
  alternates: { canonical: '/privacy' },
};

const UPDATED = '23 September 2026';

const sections = [
  {
    title: 'What I collect',
    body: [
      'Only what you choose to send. The contact form and the book-a-call page ask for your name, email address, an optional company name and your message. A call request also includes the call type, the time you picked and your time zone.',
    ],
  },
  {
    title: 'How it is used',
    body: [
      'Your message or call request is delivered to my inbox by email, through the email service Resend, so I can reply. It is not stored in a database on this site, and it is never sold or shared for marketing.',
      'To block spam, the server briefly keeps the IP address of each submission in memory to limit how many messages can be sent in a few minutes. It is not written anywhere and is gone when the server restarts.',
    ],
  },
  {
    title: 'Cookies and storage',
    body: [
      'There are no tracking cookies, analytics or advertising on this site. Your browser stores two small settings locally: your light or dark theme choice, and a note that you have already seen the intro animation in this visit. Neither leaves your device.',
    ],
  },
  {
    title: 'Hosting',
    body: [
      'Like any website, the hosting provider may keep standard technical request logs (such as IP address and browser type) for security and reliability.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'You can ask what I hold from our emails, or ask me to delete it, at any time.',
    ],
  },
];

/** Privacy Policy (owner change OC.9 — linked from the footer's legal row). */
export default function PrivacyPage() {
  const { email } = profile.contact;

  return (
    <div className="pb-8 pt-32 md:pt-40">
      <Container className="flex max-w-reading flex-col gap-12">
        <div className="hero-rise flex flex-col gap-5">
          <SectionLabel title="Privacy Policy" />
          <EmphasisHeading level={1} className="text-display-l">
            Your data, [plainly].
          </EmphasisHeading>
          <p className="font-mono text-label text-text-subtle">
            Last updated {UPDATED}
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {sections.map((section) => (
            <section
              key={section.title}
              data-reveal="up"
              className="flex flex-col gap-3"
            >
              <h2 className="text-h4 text-text">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-pretty text-body text-text-muted"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <section className="flex flex-col gap-3 border-t border-border pt-8">
            <h2 className="text-h4 text-text">Contact</h2>
            <p className="text-body text-text-muted">
              {profile.name} ·{' '}
              <a
                href={`mailto:${email}`}
                className="text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                {email}
              </a>{' '}
              · or use the{' '}
              <Link
                href="/contact"
                className="text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                contact form
              </Link>
              .
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
