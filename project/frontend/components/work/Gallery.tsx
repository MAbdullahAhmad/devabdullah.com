'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

const control =
  'inline-flex size-10 items-center justify-center rounded-pill border border-border bg-bg-elevated text-text-muted transition-colors hover:border-border-strong hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

/**
 * Screenshot grid with a lightbox (Section 6.3 gallery, Section 7.2 Lightbox).
 * Built on Radix Dialog (focus trap, Esc to close, scroll lock); the arrow keys
 * move between images.
 */
export function Gallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  // Thumbnail that opened the lightbox, so focus can return to it on close.
  const opener = useRef<HTMLButtonElement | null>(null);
  const open = index !== null;
  const current = index === null ? null : images[index];

  const step = useCallback(
    (delta: number) =>
      setIndex((value) =>
        value === null
          ? value
          : (value + delta + images.length) % images.length,
      ),
    [images.length],
  );

  if (images.length === 0) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && setIndex(null)}>
      <ul className="mt-8 grid grid-cols-2 gap-3">
        {images.map((image, i) => (
          <li key={image.src}>
            <button
              type="button"
              onClick={(event) => {
                opener.current = event.currentTarget;
                setIndex(i);
              }}
              className="group block w-full overflow-hidden rounded-md border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label={`Enlarge: ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 1024px) 360px, 50vw"
                className="h-auto w-full transition-transform ease-out [transition-duration:var(--dur-slow)] group-hover:scale-[1.02]"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-[var(--page-padding-x)] focus:outline-none"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            opener.current?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') step(1);
            if (event.key === 'ArrowLeft') step(-1);
          }}
        >
          <Dialog.Title className="sr-only">
            {current?.alt ?? 'Image'}
          </Dialog.Title>

          {current && (
            <figure className="flex max-h-full w-full max-w-5xl flex-col gap-3">
              <div className="relative overflow-hidden rounded-md border border-border">
                <Image
                  src={current.src}
                  alt={current.alt}
                  width={current.width}
                  height={current.height}
                  sizes="100vw"
                  className="max-h-[75vh] w-full object-contain"
                />
              </div>
              <figcaption className="flex items-center justify-between gap-4 text-body-s text-text-muted">
                <span>{current.caption ?? current.alt}</span>
                <span className="font-mono text-label tabular-nums text-text-subtle">
                  {(index ?? 0) + 1} / {images.length}
                </span>
              </figcaption>
            </figure>
          )}

          <div className="flex items-center gap-3">
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => step(-1)}
                className={control}
                aria-label="Previous image"
              >
                <ChevronLeft size={18} strokeWidth={1.5} aria-hidden />
              </button>
            )}
            <Dialog.Close className={control} aria-label="Close">
              <X size={18} strokeWidth={1.5} aria-hidden />
            </Dialog.Close>
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => step(1)}
                className={control}
                aria-label="Next image"
              >
                <ChevronRight size={18} strokeWidth={1.5} aria-hidden />
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
