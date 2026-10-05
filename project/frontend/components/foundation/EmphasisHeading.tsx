import { createElement, Fragment, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';

interface EmphasisHeadingProps {
  /**
   * Heading text with exactly one bracketed emphasis segment, e.g.
   * `Selected [work]`. The bracketed word renders in weight 700 + accent
   * (Section 4.6). Text without brackets renders plainly.
   */
  children: string;
  /** Heading level: 1 → h1, 2 → h2 (default), 3 → h3. */
  level?: 1 | 2 | 3;
  className?: string;
}

const EMPHASIS = /\[([^\]]+)\]/;

interface Piece {
  text: string;
  emphasis: boolean;
}

/**
 * Splits the heading into words (each a list of pieces, so punctuation that
 * follows the emphasis, as in "Selected [work].", stays in the same word).
 */
function toWords(before: string, emphasis: string, after: string) {
  const words: Piece[][] = [];
  let current: Piece[] = [];
  for (const segment of [
    { text: before, emphasis: false },
    { text: emphasis, emphasis: true },
    { text: after, emphasis: false },
  ]) {
    for (const part of segment.text.split(/(\s+)/)) {
      if (part === '') continue;
      if (/^\s+$/.test(part)) {
        if (current.length) words.push(current);
        current = [];
      } else {
        current.push({ text: part, emphasis: segment.emphasis });
      }
    }
  }
  if (current.length) words.push(current);
  return words;
}

/**
 * The signature emphasis heading: one accented, bold word per major heading.
 * Sizing comes from the caller via `className` (e.g. `text-display-l`).
 *
 * Motion (styles: "Motion system" in `styles/globals.css`): every word sits in
 * its own mask and rises into place, staggered. Page headings (`level` 1)
 * play on load in pure CSS, so they never wait for JavaScript; section
 * headings play when scrolled into view (`data-reveal="words"`). The accent
 * word then catches a single sheen of light. The heading's accessible name
 * is the plain sentence, so the split words aren't read one by one.
 */
export function EmphasisHeading({
  children,
  level = 2,
  className,
}: EmphasisHeadingProps) {
  const match = children.match(EMPHASIS);
  const [full, emphasis] = match ?? ['', ''];
  const start = match?.index ?? children.length;
  const before = children.slice(0, start);
  const after = children.slice(start + full.length);
  const words = toWords(before, emphasis, after);
  const label = `${before}${emphasis}${after}`;

  return createElement(
    `h${level}`,
    {
      className: cn(
        'font-semibold text-balance text-text',
        level === 1 && 'words-load',
        className,
      ),
      'aria-label': label,
      'data-reveal': level === 1 ? undefined : 'words',
    },
    words.map((word, index) => (
      <Fragment key={index}>
        {index > 0 && ' '}
        <span aria-hidden className="w">
          <span className="wi" style={{ '--i': index } as CSSProperties}>
            {word.map((piece, pieceIndex) =>
              piece.emphasis ? (
                <strong key={pieceIndex} className="em font-bold">
                  {piece.text}
                </strong>
              ) : (
                <Fragment key={pieceIndex}>{piece.text}</Fragment>
              ),
            )}
          </span>
        </span>
      </Fragment>
    )),
  );
}
