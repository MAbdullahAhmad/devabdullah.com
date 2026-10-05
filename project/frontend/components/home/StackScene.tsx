import type { CSSProperties } from 'react';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { Reveal } from '@/components/foundation/Reveal';
import { SkillTag } from '@/components/foundation/SkillTag';
import { StackLayer } from '@/components/home/StackLayer';
import { StackTrack } from '@/components/home/StackTrack';
import {
  alsoLine,
  stackLayers,
  type StackLayerData,
} from '@/components/home/stack-data';
import { MARK_PATHS, MARK_VIEWBOX } from '@/lib/brand-mark';

/** The pieces of the brand mark that make up each layer. */
const PIECES: Record<StackLayerData['key'], string[]> = {
  interface: [MARK_PATHS.ink[0]],
  api: [MARK_PATHS.accent],
  database: [MARK_PATHS.ink[1], MARK_PATHS.ink[2]],
};

/** Copies stacked behind each plate, 1px apart, give it real depth in 3D. */
const DEPTH = 7;

const pad = (n: number) => String(n).padStart(2, '0');

/** One plate of the exploded mark: an extruded slab plus its label. */
function Plate({ layer, index }: { layer: StackLayerData; index: number }) {
  const pieces = PIECES[layer.key];
  return (
    <div
      className={`stack-plate stack-plate-${layer.key}`}
      style={{ '--i': index } as CSSProperties}
    >
      {Array.from({ length: DEPTH }, (_, depth) => (
        <svg
          key={depth}
          viewBox={MARK_VIEWBOX}
          className="stack-slab"
          data-edge={depth > 0 ? '' : undefined}
          style={{ '--z': depth } as CSSProperties}
        >
          {pieces.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      ))}
      <span className="stack-tag">
        <span className="stack-tag-line" />
        <span className="stack-tag-box">
          <span className="stack-tag-id">
            L{index + 1} · {layer.name}
          </span>
          <span className="stack-tag-sub">
            {layer.skills.slice(0, 2).join(' · ')}
          </span>
        </span>
      </span>
    </div>
  );
}

/** The detail for one layer (or, for `index` 3, the closing "one system"). */
function Panel({ index, layer }: { index: number; layer?: StackLayerData }) {
  return (
    <div className="stack-panel" data-panel={index}>
      <span className="font-mono text-label text-text-subtle">
        {layer ? `${pad(index + 1)} / 03` : 'Interface → API → Database'}
      </span>
      <h3
        className={`text-display-m ${layer?.accent ? 'text-accent' : 'text-text'}`}
      >
        {layer?.name ?? 'One system.'}
      </h3>
      <p className="max-w-[44ch] text-pretty text-body-l text-text-muted">
        {layer?.proof ??
          'Three layers designed together, so every screen, endpoint and table agrees with the others.'}
      </p>
      {layer ? (
        <ul className="flex max-w-[34rem] flex-wrap gap-2">
          {layer.skills.map((skill) => (
            <li key={skill}>
              <SkillTag>{skill}</SkillTag>
            </li>
          ))}
        </ul>
      ) : (
        <p className="max-w-[44ch] text-body-s text-text-subtle">{alsoLine}</p>
      )}
    </div>
  );
}

/**
 * The Stack (Section 6.1): the signature skills section, told with the brand
 * mark itself, whose three layers are Interface, API and Database.
 *
 * On large screens with motion, a tall track pins the scene while you scroll.
 * The mark opens into three extruded slabs in 3D, each lighting up in turn
 * with its skills on the left and data packets travelling between the slabs,
 * then closes back into the logo: one system. `StackTrack` feeds scroll
 * progress; all rendering is CSS ("The Stack" in globals.css).
 *
 * Phones, reduced motion and no-JS get the static version: the heading and
 * three layer cards. Both are server-rendered; the scene is decorative
 * (`aria-hidden`) because the cards hold the same content for everyone else.
 */
export function StackScene() {
  const heading = (
    <div className="flex max-w-[26rem] flex-col gap-4">
      <SectionLabel number="02" title="The Stack" />
      <EmphasisHeading level={2} className="text-display-l">
        Three layers. One [system].
      </EmphasisHeading>
      <p className="text-pretty text-body-l text-text-muted">
        I work across the whole stack, but I&apos;m happiest where the data
        lives.
      </p>
    </div>
  );

  return (
    <Section id="stack" className="stack-section">
      {/* Static version: phones, reduced motion, no JavaScript. */}
      <Container className="stack-static flex flex-col gap-12">
        {heading}
        <div className="grid gap-4 md:grid-cols-3">
          {stackLayers.map((layer, index) => (
            <Reveal key={layer.key} delay={index * 0.06}>
              <StackLayer layer={layer} index={index} className="h-full" />
            </Reveal>
          ))}
        </div>
        <p className="text-body-s text-text-subtle">{alsoLine}</p>
      </Container>

      {/* The scroll scene. */}
      <StackTrack className="stack-track">
        <div className="stack-sticky">
          <Container className="grid h-full grid-cols-12 items-center gap-8">
            <div className="col-span-5 flex h-full flex-col justify-center gap-12">
              {heading}

              <div className="stack-panels">
                {stackLayers.map((layer, index) => (
                  <Panel key={layer.key} index={index} layer={layer} />
                ))}
                <Panel index={3} />
              </div>

              <ol className="stack-rail" aria-hidden>
                {stackLayers.map((layer, index) => (
                  <li
                    key={layer.key}
                    className="stack-rail-item"
                    style={{ '--i': index } as CSSProperties}
                  >
                    <span className="stack-rail-line">
                      <span className="stack-rail-fill" />
                    </span>
                    <span className="font-mono text-[0.6875rem] text-text-subtle">
                      {pad(index + 1)}
                    </span>
                    <span className="stack-rail-name text-label">
                      {layer.name}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="col-span-7 flex h-full items-center justify-center">
              <div className="stack-stage" aria-hidden>
                <div className="stack-glow" />
                <div className="stack-model">
                  {stackLayers.map((layer, index) => (
                    <Plate key={layer.key} layer={layer} index={index} />
                  ))}
                  <span className="stack-packet stack-packet-down" />
                  <span className="stack-packet stack-packet-up" />
                </div>
                <span className="stack-caption font-mono text-[0.6875rem]">
                  <span className="stack-caption-dot" /> fig. 01 — the stack,
                  exploded
                </span>
              </div>
            </div>
          </Container>
        </div>
      </StackTrack>
    </Section>
  );
}
