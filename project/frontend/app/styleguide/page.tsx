import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/foundation/Button';
import { QuoteColumns } from '@/components/ui/quote-columns';
import { seedTestimonials } from '@/content/testimonials-seed';
import { Divider } from '@/components/foundation/Divider';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { Reveal } from '@/components/foundation/Reveal';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { SkillTag } from '@/components/foundation/SkillTag';
import { StatusBadge } from '@/components/foundation/StatusBadge';
import { TechPath } from '@/components/foundation/TechPath';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ThemeToggle } from '@/components/global/ThemeToggle';
import { CodeBlock } from '@/components/work/CodeBlock';
import { Callout } from '@/components/work/Callout';
import { Gallery } from '@/components/work/Gallery';
import { ArchitectureDiagram } from '@/components/work/ArchitectureDiagram';
import { SchemaDiagram } from '@/components/work/SchemaDiagram';

export const metadata: Metadata = {
  title: 'Styleguide',
  robots: { index: false, follow: false },
};

const colorTokens: { name: string; varName: string }[] = [
  { name: 'bg', varName: '--bg' },
  { name: 'bg-elevated', varName: '--bg-elevated' },
  { name: 'surface', varName: '--surface' },
  { name: 'border', varName: '--border' },
  { name: 'border-strong', varName: '--border-strong' },
  { name: 'text', varName: '--text' },
  { name: 'text-muted', varName: '--text-muted' },
  { name: 'text-subtle', varName: '--text-subtle' },
  { name: 'accent', varName: '--accent' },
  { name: 'accent-hover', varName: '--accent-hover' },
  { name: 'accent-text', varName: '--accent-text' },
  { name: 'accent-soft', varName: '--accent-soft' },
  { name: 'success', varName: '--success' },
  { name: 'danger', varName: '--danger' },
];

const typeScale: { token: string; sample: string }[] = [
  { token: 'text-display-xl', sample: 'Display XL' },
  { token: 'text-display-l', sample: 'Display L' },
  { token: 'text-display-m', sample: 'Display M' },
  { token: 'text-h3', sample: 'Heading 3' },
  { token: 'text-h4', sample: 'Heading 4' },
  { token: 'text-body-l', sample: 'Body large — the quick brown fox.' },
  {
    token: 'text-body',
    sample: 'Body — the quick brown fox jumps over the lazy dog.',
  },
  { token: 'text-body-s', sample: 'Body small — the quick brown fox.' },
];

/** Generated placeholder art for the styleguide only (not project imagery). */
const sampleImage = (label: string, hue: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750"><rect width="1200" height="750" fill="#111113"/><rect x="60" y="60" width="1080" height="630" rx="24" fill="none" stroke="${hue}" stroke-width="2" stroke-dasharray="8 10"/><text x="600" y="390" fill="#9a9aa3" font-family="monospace" font-size="40" text-anchor="middle">${label}</text></svg>`,
  )}`;

const sampleCode = `class OrderLifecycle
{
    private const FLOW = ['drop_off', 'processing', 'ready', 'delivered'];

    public function advance(Order $order): Order
    {
        $next = $this->nextStatus($order->status);
        $order->update(['status' => $next]);

        return $order;
    }
}`;

const radii: { token: string; label: string }[] = [
  { token: 'rounded-sm', label: 's · 6px' },
  { token: 'rounded-md', label: 'm · 12px' },
  { token: 'rounded-lg', label: 'l · 20px' },
  { token: 'rounded-pill', label: 'pill' },
];

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionLabel title={title} />
      {children}
    </div>
  );
}

export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <Section>
      <Container className="flex flex-col gap-16">
        <header className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <SectionLabel number="00" title="Styleguide" />
            <EmphasisHeading level={1} className="text-display-m">
              The [Ink] and Paper system
            </EmphasisHeading>
          </div>
          <ThemeToggle />
        </header>

        <Divider />

        <Block title="Colour tokens">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {colorTokens.map((token) => (
              <div key={token.name} className="flex flex-col gap-2">
                <div
                  className="h-16 rounded-md border border-border"
                  style={{ background: `var(${token.varName})` }}
                />
                <span className="font-mono text-label text-text-muted">
                  {token.name}
                </span>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Typography">
          <div className="flex flex-col gap-4">
            {typeScale.map((row) => (
              <div key={row.token} className="flex flex-col gap-1">
                <span className="font-mono text-label text-text-subtle">
                  {row.token}
                </span>
                <span className={`${row.token} text-text`}>{row.sample}</span>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-label text-text-subtle">
                text-label · Geist Mono
              </span>
              <span className="font-mono text-label text-text-muted">
                ( 01 — Section Label )
              </span>
            </div>
          </div>
        </Block>

        <Block title="Radius and depth">
          <div className="flex flex-wrap items-end gap-6">
            {radii.map((radius) => (
              <div
                key={radius.token}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`size-20 border border-border bg-surface ${radius.token}`}
                />
                <span className="font-mono text-label text-text-muted">
                  {radius.label}
                </span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <div
                className="size-20 rounded-md border border-border bg-bg-elevated"
                style={{ boxShadow: 'var(--shadow-floating)' }}
              />
              <span className="font-mono text-label text-text-muted">
                shadow-floating
              </span>
            </div>
          </div>
        </Block>

        <Block title="Buttons">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link action</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button href="/">As link</Button>
            </div>
          </div>
        </Block>

        <Block title="Signature patterns">
          <div className="flex flex-col gap-6">
            <EmphasisHeading level={2} className="text-display-l">
              I build the [backend] systems businesses run on.
            </EmphasisHeading>
            <TechPath items={['Laravel', 'PHP', 'MySQL', 'JavaScript']} />
            <div className="flex flex-wrap gap-2">
              <SkillTag>TypeScript</SkillTag>
              <SkillTag>Next.js</SkillTag>
              <SkillTag>PostgreSQL</SkillTag>
              <SkillTag>Docker</SkillTag>
            </div>
            <StatusBadge />
          </div>
        </Block>

        <Block title="Dividers">
          <div className="flex flex-col gap-8">
            <Divider />
            <Divider label="03 — Selected Work" />
          </div>
        </Block>

        <Block title="Case study components">
          <div className="flex max-w-reading flex-col">
            <CodeBlock
              code={sampleCode}
              lang="php"
              filename="Sample.php — styleguide sample"
              highlight={[7, 8]}
            />
            <ArchitectureDiagram
              caption="Styleguide sample — generic layers, not a real system."
              links={['HTTP', 'calls', 'SQL']}
              nodes={[
                {
                  id: 'client',
                  layer: 'Client',
                  title: 'Browser',
                  detail: 'UI',
                  note: 'Sample note for the client layer.',
                },
                {
                  id: 'api',
                  layer: 'API',
                  title: 'App server',
                  detail: 'Routes',
                  note: 'Sample note for the API layer.',
                  accent: true,
                },
                {
                  id: 'services',
                  layer: 'Services',
                  title: 'Domain logic',
                  detail: 'Rules',
                  note: 'Sample note for the services layer.',
                },
                {
                  id: 'db',
                  layer: 'Database',
                  title: 'SQL store',
                  detail: 'Tables',
                  note: 'Sample note for the data layer.',
                },
              ]}
            />
            <SchemaDiagram
              caption="Styleguide sample — a generic schema, not a real project."
              tables={[
                {
                  name: 'authors',
                  columns: [
                    { name: 'id', type: 'bigint', key: 'pk' },
                    { name: 'name', type: 'varchar' },
                  ],
                },
                {
                  name: 'posts',
                  columns: [
                    { name: 'id', type: 'bigint', key: 'pk' },
                    { name: 'author_id', type: 'bigint', key: 'fk' },
                    { name: 'title', type: 'varchar' },
                  ],
                },
                {
                  name: 'comments',
                  columns: [
                    { name: 'id', type: 'bigint', key: 'pk' },
                    { name: 'post_id', type: 'bigint', key: 'fk' },
                    { name: 'body', type: 'text' },
                  ],
                },
                {
                  name: 'tags',
                  columns: [
                    { name: 'id', type: 'bigint', key: 'pk' },
                    { name: 'label', type: 'varchar' },
                  ],
                },
              ]}
              relations={[
                {
                  from: 'posts.author_id',
                  to: 'authors.id',
                  label: 'many → one',
                },
                {
                  from: 'comments.post_id',
                  to: 'posts.id',
                  label: 'many → one',
                },
              ]}
            />
            <Callout type="note">
              <p>Notes add context without breaking the flow of reading.</p>
            </Callout>
            <Callout type="decision" title="Schema first">
              <p>Decisions carry the accent rule so readers notice them.</p>
            </Callout>
            <Callout type="trade-off">
              <p>Trade-offs record what was given up, and why.</p>
            </Callout>
            <Gallery
              images={[
                {
                  src: sampleImage('Sample image 1', '#2f6bff'),
                  alt: 'Styleguide sample image one',
                  width: 1200,
                  height: 750,
                },
                {
                  src: sampleImage('Sample image 2', '#34343c'),
                  alt: 'Styleguide sample image two',
                  width: 1200,
                  height: 750,
                },
              ]}
            />
          </div>
        </Block>

        <Block title="Quote columns (sample data — preview only)">
          <QuoteColumns items={seedTestimonials} />
        </Block>

        <Block title="Reveal">
          <Reveal className="rounded-md border border-border bg-surface p-6">
            <p className="text-body text-text-muted">
              This block fades up on scroll (plain fade with reduced motion).
            </p>
          </Reveal>
        </Block>
      </Container>
    </Section>
  );
}
