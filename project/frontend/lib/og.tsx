import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { MARK_PATHS, MARK_VIEWBOX } from '@/lib/brand-mark';

export const OG_SIZE = { width: 1200, height: 630 };

const FONT_DIR = path.join(process.cwd(), 'node_modules/geist/dist/fonts');

async function fonts() {
  const [regular, semibold, mono] = await Promise.all([
    readFile(path.join(FONT_DIR, 'geist-sans/Geist-Regular.ttf')),
    readFile(path.join(FONT_DIR, 'geist-sans/Geist-SemiBold.ttf')),
    readFile(path.join(FONT_DIR, 'geist-mono/GeistMono-Medium.ttf')),
  ]);
  return [
    {
      name: 'Geist',
      data: regular,
      weight: 400 as const,
      style: 'normal' as const,
    },
    {
      name: 'Geist',
      data: semibold,
      weight: 600 as const,
      style: 'normal' as const,
    },
    {
      name: 'GeistMono',
      data: mono,
      weight: 500 as const,
      style: 'normal' as const,
    },
  ];
}

const INK = '#0a0a0b';
const TEXT = '#ededef';
const MUTED = '#9a9aa3';
const SUBTLE = '#6b6b74';
const BORDER = '#232329';
const ACCENT = '#2f6bff';

/**
 * Branded Open Graph image (Blueprint Section 12.3): logo, page title and an
 * eyebrow on the Ink background, with the faint grid from the hero.
 */
export async function renderOg({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        backgroundColor: INK,
        backgroundImage: `linear-gradient(to right, ${BORDER} 1px, transparent 1px), linear-gradient(to bottom, ${BORDER} 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
        fontFamily: 'Geist',
        color: TEXT,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <svg width={48} height={50} viewBox={MARK_VIEWBOX}>
          {MARK_PATHS.ink.map((d) => (
            <path key={d} d={d} fill={TEXT} />
          ))}
          <path d={MARK_PATHS.accent} fill={ACCENT} />
        </svg>
        <div
          style={{
            display: 'flex',
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: '-0.035em',
          }}
        >
          <span>The</span>
          <span style={{ color: ACCENT }}>Mac</span>
          <span>Stack</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div
          style={{
            display: 'flex',
            fontFamily: 'GeistMono',
            fontSize: 26,
            color: SUBTLE,
          }}
        >
          {`( ${eyebrow} )`}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 34 ? 68 : 84,
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: MUTED,
              maxWidth: 920,
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>,
    { ...OG_SIZE, fonts: await fonts() },
  );
}
