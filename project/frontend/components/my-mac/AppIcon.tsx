import Image from 'next/image';
import type { ReactNode } from 'react';
import styles from './my-mac.module.css';

export type AppIconName =
  | 'finder'
  | 'notes'
  | 'safari'
  | 'contacts'
  | 'terminal'
  | 'mail'
  | 'instagram'
  | 'linkedin'
  | 'github'
  | 'apps'
  | 'settings'
  | 'folder'
  | 'document';

const nativeIcons = new Set<AppIconName>([
  'finder',
  'notes',
  'safari',
  'contacts',
  'terminal',
  'mail',
  'apps',
  'settings',
  'folder',
]);

const clearGlyphs: Record<AppIconName, ReactNode> = {
  finder: (
    <>
      <path d="M35 7 28 33h10l-4 25" />
      <path d="M14 24v4m34-4v4M13 40q18 16 39-1" />
    </>
  ),
  notes: (
    <>
      <path d="M13 21h38M16 33h32M16 45h32" />
      <path d="M15 13h1m8 0h1m8 0h1m8 0h1" strokeWidth="3" />
    </>
  ),
  safari: (
    <>
      <circle cx="32" cy="32" r="24" />
      <path d="m43 21-7 15-15 7 7-15Z" fill="currentColor" fillOpacity=".7" />
      <path d="M32 9v4m0 38v4M9 32h4m38 0h4" />
    </>
  ),
  contacts: (
    <>
      <circle cx="30" cy="25" r="10" fill="currentColor" fillOpacity=".75" />
      <path d="M12 53c0-20 36-20 36 0" fill="currentColor" fillOpacity=".75" />
      <path d="M55 17v7m0 9v7m0 9v4" />
    </>
  ),
  terminal: (
    <>
      <path d="m13 20 13 12-13 12m20 0h17" strokeWidth="4" />
    </>
  ),
  mail: (
    <>
      <rect x="9" y="16" width="46" height="33" rx="4" />
      <path d="m10 18 22 18 22-18M10 47l15-15m29 15L39 32" />
    </>
  ),
  instagram: (
    <>
      <rect x="10" y="10" width="44" height="44" rx="13" strokeWidth="4" />
      <circle cx="32" cy="32" r="11" strokeWidth="4" />
      <circle cx="46" cy="18" r="3" fill="currentColor" stroke="none" />
    </>
  ),
  linkedin: (
    <>
      <circle cx="16" cy="16" r="3" fill="currentColor" />
      <path d="M16 27v24m14 0V27m0 8c0-13 20-13 20 0v16" strokeWidth="6" />
    </>
  ),
  github: (
    <path
      d="M32 9a23 23 0 0 0-8 45v-8c-8 1-10-4-10-4-1-3-4-4-4-4 4-2 6 3 6 3 2 4 6 3 8 2l2-5C14 38 13 25 20 21c-1-3-1-7 1-10l10 5 10-5c2 3 2 7 1 10 8 6 5 15-4 17l2 5v11A23 23 0 0 0 32 9Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  apps: (
    <>
      {[17, 32, 47].flatMap((x) =>
        [17, 32, 47].map((y) => (
          <rect
            key={`${x}-${y}`}
            x={x - 4}
            y={y - 4}
            width="8"
            height="8"
            rx="2"
            fill="currentColor"
            stroke="none"
          />
        )),
      )}
    </>
  ),
  settings: (
    <>
      <path d="m27 8 10 0 2 7 6 3 7-2 5 9-5 5v6l5 5-5 9-7-2-6 3-2 7H27l-2-7-6-3-7 2-5-9 5-5v-6l-5-5 5-9 7 2 6-3Z" />
      <circle cx="32" cy="33" r="12" />
    </>
  ),
  folder: (
    <path d="M8 19v-5h19l6 7h23v31H8Z" fill="currentColor" fillOpacity=".3" />
  ),
  document: (
    <>
      <path d="M17 8h21l10 11v37H17Z" />
      <path d="M37 8v12h11M24 30h17M24 38h17M24 46h12" />
    </>
  ),
};

/** Tahoe 26.6.2 artwork in Default mode; a glass/glyph composition in Clear mode. */
export function AppIcon({ name }: { name: AppIconName }) {
  return (
    <span className={styles.appIcon} data-app-icon={name} aria-hidden>
      <Image
        className={styles.nativeArtwork}
        src={
          nativeIcons.has(name)
            ? `/my-mac/tahoe/${name}.webp`
            : `/my-mac/icons/${name}.svg`
        }
        alt=""
        width={64}
        height={64}
        draggable={false}
        unoptimized
      />
      <span className={styles.clearArtwork}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {clearGlyphs[name]}
        </svg>
      </span>
    </span>
  );
}
