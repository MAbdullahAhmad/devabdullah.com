import type { CSSProperties } from 'react';
import { ArrowRight, Mail } from 'lucide-react';

import { profile } from '@/content/profile';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/foundation/Button';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { TechPath } from '@/components/foundation/TechPath';
import { buildApiMe } from '@/lib/api-me';

const delay = (ms: number) => ({ '--hd': `${ms}ms` }) as CSSProperties;
type Point = [x: number, y: number];
const toPath = (points: Point[]) =>
  points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y * 1.2}`).join(' ');

const CALLOUTS: {
  label: string;
  value: string;
  side: 'l' | 'r';
  points: Point[];
}[] = [
  {
    label: 'Profile',
    value: 'Abdullah Ahmad',
    side: 'l',
    points: [
      [38, 16],
      [26, 16],
    ],
  },
  {
    label: 'Frontend',
    value: 'Next.js · React',
    side: 'r',
    points: [
      [69, 46],
      [69, 33],
      [74, 33],
    ],
  },
  {
    label: 'Domain',
    value: 'devabdullah.com',
    side: 'l',
    points: [
      [40, 61],
      [34, 49],
      [26, 49],
    ],
  },
  {
    label: 'API',
    value: '/api/* → backend',
    side: 'r',
    points: [
      [73, 77],
      [73, 64],
      [74, 64],
    ],
  },
];

const api = buildApiMe('');
const API_LINES: [key: string, value: string][] = [
  ['name', JSON.stringify(api.name)],
  ['role', JSON.stringify(api.role)],
  ['available', String(api.available)],
];

export function Hero() {
  return (
    <section className="hero relative">
      <Container className="grid min-h-[calc(100svh-1rem)] items-center gap-14 pb-20 pt-32 lg:grid-cols-12 lg:gap-8 lg:pt-28">
        <div className="relative z-10 flex flex-col items-start gap-7 lg:col-span-6">
          <p
            className="hero-rise inline-flex items-center gap-3 rounded-pill border border-border bg-bg-elevated/70 py-1.5 pl-3 pr-4 text-label text-text-muted backdrop-blur-md"
            style={{ animationDelay: '0ms' }}
          >
            <span className="relative flex size-2" aria-hidden>
              <span className="relative inline-flex size-2 rounded-pill bg-accent" />
            </span>
            Portfolio foundation
            <span className="text-text-subtle" aria-hidden>
              /
            </span>
            devabdullah.com
          </p>

          <EmphasisHeading
            level={1}
            className="max-w-[14ch] text-display-xl [font-size:clamp(2.75rem,5.4vw,5.25rem)]!"
          >
            {`I’m Abdullah. This is my [portfolio].`}
          </EmphasisHeading>

          <p
            className="hero-rise max-w-[52ch] text-pretty text-body-l text-text-muted"
            style={{ animationDelay: '140ms' }}
          >
            {profile.summary}
          </p>

          <div
            className="hero-rise flex flex-wrap items-center gap-3"
            style={{ animationDelay: '220ms' }}
          >
            <Button href="/about" variant="primary" size="lg">
              About this portfolio
              <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
            </Button>
            <Button
              href={`mailto:${profile.contact.email}`}
              variant="secondary"
              size="lg"
            >
              <Mail size={18} strokeWidth={1.5} aria-hidden />
              Email
            </Button>
          </div>

          <div
            className="hero-rise flex items-center gap-4 border-t border-border pt-5"
            style={{ animationDelay: '300ms' }}
          >
            <span className="font-mono text-label uppercase tracking-[0.12em] text-text-subtle">
              Site stack
            </span>
            <TechPath items={['Next.js', 'React', 'TypeScript']} />
          </div>
        </div>

        <div
          aria-hidden
          className="hero-stage relative mx-auto aspect-[5/6] w-full max-w-[34rem] lg:col-span-6 lg:max-w-none"
        >
          <div className="hs-glow" />
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner, index) => (
            <span
              key={corner}
              className={`hs-corner hs-corner-${corner}`}
              style={delay(index * 80)}
            />
          ))}
          <span className="hs-meta hs-meta-tl" style={delay(200)}>
            SUBJECT_01 {'//'} A.AHMAD
          </span>
          <span className="hs-meta hs-meta-tr" style={delay(260)}>
            DEVABDULLAH.COM
          </span>
          <span className="hs-meta hs-meta-bl" style={delay(320)}>
            <span className="hs-live" /> SYS ONLINE
          </span>
          <span className="hs-meta hs-meta-br" style={delay(380)}>
            PORTFOLIO V1
          </span>

          <div className="hs-figure">
            <div className="hs-person">
              {/* eslint-disable-next-line @next/next/no-img-element -- local SVG brand mark */}
              <img
                className="hs-helmet object-contain p-16"
                src="/icon.svg"
                alt=""
                width={480}
                height={480}
                fetchPriority="high"
              />
            </div>
          </div>

          <svg className="hs-lines" viewBox="0 0 100 120">
            {CALLOUTS.map((callout, index) => (
              <path
                key={callout.label}
                d={toPath(callout.points)}
                pathLength={1}
                style={delay(700 + index * 160)}
              />
            ))}
          </svg>

          {CALLOUTS.map(({ label, points: [[x, y]] }, index) => (
            <span
              key={label}
              className="hs-dot"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                ...delay(620 + index * 160),
              }}
            />
          ))}

          {CALLOUTS.map(({ label, value, side, points }, index) => (
            <span
              key={label}
              className={`hs-chip hs-chip-${side}`}
              style={{
                top: `${points[points.length - 1][1]}%`,
                ...delay(900 + index * 160),
              }}
            >
              <span className="hs-chip-label">{label}</span>
              <span className="hs-chip-value">{value}</span>
            </span>
          ))}

          <div className="hs-api" style={delay(1150)}>
            <div className="hs-api-bar">
              <span>
                <span className="text-accent">GET</span> /api/me
              </span>
              <span className="hs-api-status">200 OK</span>
            </div>
            <pre className="hs-api-body">
              {'{'}
              {API_LINES.map(([key, value], index) => (
                <span
                  key={key}
                  className="hs-api-line"
                  style={delay(1350 + index * 140)}
                >
                  {'  '}
                  <span className="text-accent">&quot;{key}&quot;</span>:{' '}
                  {value}
                  {index < API_LINES.length - 1 ? ',' : ''}
                </span>
              ))}
              {'}'}
              <span className="hs-caret" />
            </pre>
          </div>
        </div>
      </Container>
    </section>
  );
}
