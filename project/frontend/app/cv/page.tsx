import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import { profile } from '@/content/profile';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/foundation/Button';
import { PrintButton } from '@/components/cv/PrintButton';

export const metadata: Metadata = {
  title: `CV — ${profile.name}`,
  description:
    'CV page for Abdullah Ahmad. Verified experience, skills and education will be added progressively.',
  alternates: { canonical: '/cv' },
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-border py-10 md:grid-cols-12 md:gap-8 print:grid-cols-12 print:gap-4 print:py-4">
      <h2 className="font-mono text-label text-text-subtle md:col-span-3 print:col-span-3">
        {label}
      </h2>
      <div className="flex flex-col gap-8 md:col-span-9 print:col-span-9 print:gap-3">
        {children}
      </div>
    </section>
  );
}

const link =
  'text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2 print:text-text print:no-underline';

/**
 * The CV as a web page (Section 6.5), rendered from the same `profile` data as
 * the rest of the site so the two never disagree. A print stylesheet turns it
 * into a clean document; "Save as PDF" uses it unless a PDF is configured via
 * `profile.cvPdf`. The phone number is intentionally left off the public page.
 */
export default function CvPage() {
  const { contact } = profile;

  return (
    <article className="pb-16 pt-32 md:pt-40 print:p-0">
      <Container
        size="reading"
        className="max-w-[56rem] print:max-w-none print:px-0"
      >
        <header className="hero-rise flex flex-col gap-6 pb-10 print:gap-2 print:pb-4">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex flex-col gap-3 print:gap-1">
              <h1 className="text-display-m text-text print:text-[22pt]">
                {profile.name}
              </h1>
              <p className="text-body-s text-text-muted">{profile.headline}</p>
            </div>
            <div className="print:hidden">
              {profile.cvPdf ? (
                <Button href={profile.cvPdf} download>
                  <Download size={16} strokeWidth={1.5} aria-hidden />
                  Download PDF
                </Button>
              ) : (
                <PrintButton />
              )}
            </div>
          </div>

          <p className="text-body-s text-text-muted">
            {profile.location.city}, {profile.location.country}
          </p>
          <p className="flex flex-wrap gap-x-5 gap-y-1 text-body-s">
            <a href={`mailto:${contact.email}`} className={link}>
              {contact.email}
            </a>
            <a href={contact.linkedin} className={link}>
              {contact.linkedin.replace(/^https:\/\/(www\.)?/, '')}
            </a>
            <a href={contact.github} className={link}>
              {contact.github.replace(/^https:\/\//, '')}
            </a>
          </p>
        </header>

        <Row label="Summary">
          <p className="text-pretty text-body text-text-muted print:text-[10pt]">
            {profile.summary}
          </p>
        </Row>

        <Row label="Skills">
          <dl className="flex flex-col gap-3 print:gap-1">
            {profile.skills.map((group) => (
              <div key={group.label} className="flex flex-col gap-0.5">
                <dt className="text-body-s font-medium text-text">
                  {group.label}
                </dt>
                <dd className="text-body-s text-text-muted">
                  {group.items.join(', ')}
                </dd>
              </div>
            ))}
          </dl>
        </Row>

        <Row label="Experience">
          {profile.experience.map((role) => (
            <div
              key={`${role.title}-${role.start}`}
              className="flex break-inside-avoid flex-col gap-3 print:gap-1"
            >
              <div className="flex flex-col gap-1 print:gap-0">
                <h3 className="text-h4 text-text">{role.title}</h3>
                <p className="font-mono text-label text-text-subtle">
                  {role.company} · {role.location} · {role.type} · {role.start}{' '}
                  – {role.end}
                </p>
              </div>
              <ul className="flex flex-col gap-1.5 print:gap-0.5">
                {role.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="relative pl-4 text-body-s text-text-muted before:absolute before:left-0 before:top-[0.7em] before:size-1 before:rounded-pill before:bg-border-strong"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Row>

        <Row label="Projects">
          {profile.projects.map((project) => (
            <div
              key={project.name}
              className="flex break-inside-avoid flex-col gap-3 print:gap-1"
            >
              <div className="flex flex-col gap-1 print:gap-0">
                <h3 className="text-h4 text-text">
                  {project.name} — {project.subtitle}
                </h3>
                <p className="font-mono text-label text-text-subtle">
                  {project.stack.join(', ')}
                </p>
              </div>
              <ul className="flex flex-col gap-1.5 print:gap-0.5">
                {project.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="relative pl-4 text-body-s text-text-muted before:absolute before:left-0 before:top-[0.7em] before:size-1 before:rounded-pill before:bg-border-strong"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Row>

        <Row label="Education">
          {profile.education.map((item) => (
            <div key={item.qualification} className="flex flex-col gap-1">
              <h3 className="text-h4 text-text">{item.qualification}</h3>
              <p className="font-mono text-label text-text-subtle">
                {item.institution}, {item.location} · {item.start} – {item.end}
                {item.grade && ` · Grade: ${item.grade}`}
              </p>
            </div>
          ))}
        </Row>

        <Row label="Certifications">
          {profile.certifications.map((cert) => (
            <p key={cert.name} className="text-body-s text-text-muted">
              <span className="text-text">{cert.name}</span>, {cert.issuer} ·
              Issued {cert.issued}
            </p>
          ))}
        </Row>

        <Row label="Languages">
          <p className="text-body-s text-text-muted">
            {profile.languages
              .map((language) => `${language.name}: ${language.level}`)
              .join(' · ')}
          </p>
        </Row>
      </Container>
    </article>
  );
}
