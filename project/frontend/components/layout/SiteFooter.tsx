import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { profile } from '@/content/profile';
import { FooterMotion } from '@/components/layout/FooterMotion';
import { stackLogos } from '@/components/layout/stack-logos';
import { dmSerif, signatureFont } from '@/components/layout/footer-fonts';
import styles from '@/components/layout/site-footer.module.css';

const pages = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const socials = [
  { label: 'LinkedIn', href: profile.contact.linkedin },
  { label: 'GitHub', href: profile.contact.github },
  ...(profile.contact.instagram
    ? [{ label: 'Instagram', href: profile.contact.instagram }]
    : []),
  { label: 'Email', href: `mailto:${profile.contact.email}` },
];

const SIGNATURE = profile.name.split(' ')[0];

/** Letters as separate spans, for the hover roll. */
function Chars({ text }: { text: string }) {
  return (
    <span className={styles.roll}>
      {[...text].map((char, index) => (
        <span
          key={index}
          className={styles.char}
          style={{ '--i': index } as CSSProperties}
        >
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  );
}

/**
 * A footer link: the real label for assistive tech, and a visual copy that
 * wipes in on reveal and rolls on hover.
 */
function RollLink({
  href,
  label,
  index,
  accent,
}: {
  href: string;
  label: string;
  index: number;
  accent?: boolean;
}) {
  const content = (
    <span className={styles.clipText}>
      <span className="sr-only">{label}</span>
      <span
        aria-hidden
        className={styles.wipe}
        style={{ '--w': index } as CSSProperties}
      >
        <span className={styles.wipeText}>
          <Chars text={label} />
        </span>
      </span>
    </span>
  );
  const className = `${styles.link} ${accent ? styles.linkAccent : ''}`;

  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </a>
  );
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav aria-label={title} className={styles.col}>
      <p className={styles.eyebrow}>{title}</p>
      {children}
    </nav>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * Site footer (owner change OC.9), rebuilt from the landonorris.com footer in
 * this site's colours and with its own assets: a masked panel with a raised
 * tab inside a frame of the page background that glows with the accent; a
 * signature and a two-line statement; pages and socials with rolling hover
 * letters; the helmeted developer figure with a book-a-call button; a
 * scroll-reactive stack strip behind the figure; contour lines; and the legal
 * row in the frame. The panel rises into place as the footer scrolls in.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-site-footer
      className={`${styles.footer} ${dmSerif.variable} ${signatureFont.variable} print:hidden`}
    >
      <FooterMotion />
      <div className={styles.layout}>
        <div aria-hidden className={styles.spacer} />
        <div className={styles.stage}>
          <div className={styles.clip}>
            <div className={styles.inner}>
              <div className={styles.links}>
                <Column title="Pages">
                  <div className={styles.list}>
                    {pages.map((page, index) => (
                      <RollLink
                        key={page.href}
                        href={page.href}
                        label={page.label}
                        index={index}
                      />
                    ))}
                  </div>
                  <RollLink
                    href="/book-a-call"
                    label="Book a call"
                    index={pages.length}
                    accent
                  />
                </Column>

                <Column title="Follow on">
                  <div className={styles.list}>
                    {socials.map((social, index) => (
                      <RollLink
                        key={social.label}
                        href={social.href}
                        label={social.label}
                        index={index}
                      />
                    ))}
                  </div>
                </Column>
              </div>

              <div className={styles.statement}>
                <div className={styles.statementLayout}>
                  <svg
                    className={styles.signature}
                    viewBox="0 0 400 180"
                    aria-hidden
                  >
                    <text x="200" y="120" fontSize="120" textAnchor="middle">
                      {[...SIGNATURE].map((letter, index) => (
                        <tspan
                          key={index}
                          style={{ '--i': index } as CSSProperties}
                        >
                          {letter}
                        </tspan>
                      ))}
                    </text>
                  </svg>

                  <h2 className="sr-only">Always building the next system.</h2>
                  <p aria-hidden className={styles.statementText}>
                    <span
                      className={styles.wipe}
                      style={{ '--w': 0 } as CSSProperties}
                    >
                      <span className={styles.wipeText}>
                        Always <span className={styles.serif}>building</span>
                      </span>
                    </span>
                    <span
                      className={styles.wipe}
                      style={{ '--w': 1 } as CSSProperties}
                    >
                      <span className={styles.wipeText}>
                        the next <span className={styles.serif}>system</span>.
                      </span>
                    </span>
                  </p>
                </div>
              </div>

              <div className={styles.portraitWrap}>
                <div className={styles.portraitLayout}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a pre-optimised WebP; plain <img> keeps next/image's client code off every page */}
                  <img
                    src="/icon.svg"
                    alt=""
                    width={860}
                    height={1290}
                    loading="lazy"
                    decoding="async"
                    className={styles.figure}
                  />
                  <div className={styles.buttonWrap}>
                    <Link href="/book-a-call" className={styles.button}>
                      <span className={styles.clipText}>
                        <span className="sr-only">Book a call</span>
                        <span aria-hidden>
                          <Chars text="Book a call" />
                        </span>
                      </span>
                      <span className={styles.arrow} aria-hidden>
                        <ArrowIcon />
                        <ArrowIcon />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              <div aria-hidden className={styles.marquee}>
                <div className={styles.track} data-footer-track>
                  {[0, 1, 2].map((copy) => (
                    <div key={copy} className="flex">
                      {stackLogos.map((logo) => (
                        <span key={logo.name} className={styles.logo}>
                          <svg viewBox="0 0 24 24">
                            <path d={logo.path} />
                          </svg>
                          {logo.name}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG pattern, lazy-loaded */}
              <img
                src="/images/footer-contours.svg"
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className={styles.pattern}
              />
            </div>
          </div>

          <div className={styles.legal}>
            <p>
              <strong>
                © {year} {profile.name}.
              </strong>{' '}
              All rights reserved
            </p>
            <div className={styles.legalLinks}>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/cv">CV</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
