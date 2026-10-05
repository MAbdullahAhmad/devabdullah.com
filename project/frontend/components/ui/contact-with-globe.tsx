import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Mail,
  MapPin,
} from 'lucide-react';
import { profile } from '@/content/profile';
import { Container } from '@/components/layout/Container';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { CopyEmail } from '@/components/home/CopyEmail';
import { ContactForm } from '@/components/contact/ContactForm';
import { GlobeWireframe } from '@/components/ui/globe-wireframe';

/** Neutral globe marker until a verified location is supplied. */
const PROFILE_MARKER = [0, 0] as const;

/** Decorative dotted rule between the card heading and the form. */
function FormDots() {
  return (
    <div aria-hidden className="relative h-4 w-full text-border-strong">
      <div
        className="absolute inset-0 bg-repeat"
        style={{
          backgroundImage:
            'radial-gradient(circle, currentColor 0.8px, transparent 0.8px)',
          backgroundSize: '6px 100%',
          maskImage:
            'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      />
    </div>
  );
}

const linkRow =
  'group flex w-fit items-center gap-3 rounded-sm text-body-s text-text-muted transition-colors ease-out [transition-duration:var(--dur-base)] hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
const iconTile =
  'flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-text-subtle transition-colors ease-out [transition-duration:var(--dur-base)] group-hover:border-accent/40 group-hover:bg-accent-soft group-hover:text-accent-text';

/**
 * Contact with a globe (owner change OC.7), adapted from the 21st.dev
 * `contact-with-globe` component to this codebase: design tokens instead of
 * zinc/rose, CSS entrances instead of Motion, the real contact form (Server
 * Action) instead of an unwired one, and real details — no phone number.
 */
export function ContactWithGlobe() {
  const { email, linkedin, github } = profile.contact;

  return (
    <section className="relative isolate overflow-hidden pb-16 pt-32 md:pt-40">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(60%_60%_at_50%_0%,var(--accent-soft),transparent_70%)]"
      />
      <Container>
        <div className="hero-rise mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <span className="inline-flex items-center rounded-pill border border-accent/30 bg-accent-soft px-4 py-1.5 text-body-s font-medium text-accent-text">
            Contact
          </span>
          <EmphasisHeading level={1} className="text-display-l">
            Let&apos;s build something [solid].
          </EmphasisHeading>
          <p className="max-w-[46ch] text-pretty text-body-l text-text-muted">
            Need a system built, a database untangled or an API designed? Tell
            me about it — or book a call if you&apos;d rather talk.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl items-start gap-10 lg:grid-cols-2">
          <div
            className="hero-rise flex flex-col gap-6"
            style={{ animationDelay: '120ms' }}
          >
            <div className="flex flex-col gap-1.5">
              <h2 className="text-h4 text-text">Get in touch</h2>
              <p className="max-w-[40ch] text-body-s text-text-muted">
                Reach out through any channel below, whichever suits you.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              <li className="flex flex-wrap items-center gap-3">
                <a href={`mailto:${email}`} className={linkRow}>
                  <span className={iconTile}>
                    <Mail size={15} strokeWidth={1.5} aria-hidden />
                  </span>
                  {email}
                </a>
                <CopyEmail email={email} />
              </li>
              <li>
                <Link href="/book-a-call" className={linkRow}>
                  <span className={iconTile}>
                    <CalendarDays size={15} strokeWidth={1.5} aria-hidden />
                  </span>
                  Book a call
                  <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
              <li className="flex items-center gap-3 text-body-s text-text-muted">
                <span className={iconTile}>
                  <MapPin size={15} strokeWidth={1.5} aria-hidden />
                </span>
                {profile.location.city}, {profile.location.country}
              </li>
            </ul>

            <div className="flex gap-5 pl-1 text-body-s">
              {[
                { label: 'LinkedIn', href: linkedin },
                { label: 'GitHub', href: github },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-text-muted transition-colors hover:text-text"
                >
                  {item.label}
                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.5}
                    aria-hidden
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              ))}
            </div>

            <div className="relative h-60 overflow-hidden sm:h-72">
              <GlobeWireframe
                marker={PROFILE_MARKER}
                className="absolute inset-x-0 top-0 mx-auto w-full max-w-[26rem] text-text-muted"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg to-transparent" />
              <p className="absolute bottom-2 left-0 font-mono text-label text-text-subtle">
                Location to be added
              </p>
            </div>
          </div>

          <div
            className="hero-rise flex flex-col gap-5 rounded-lg border border-border bg-bg-elevated p-6 shadow-[var(--shadow-floating)] sm:p-8"
            style={{ animationDelay: '220ms' }}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-h4 text-text">Send a message</h2>
              <p className="text-body-s text-text-muted">
                Fill in the form and I&apos;ll get back to you by email.
              </p>
            </div>
            <FormDots />
            <ContactForm bare />
          </div>
        </div>
      </Container>
    </section>
  );
}
