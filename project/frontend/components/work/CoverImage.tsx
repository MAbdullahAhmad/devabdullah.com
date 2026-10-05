'use client';

import { lazy, Suspense } from 'react';
import type { ImageProps } from 'next/image';

const Image = lazy(() => import('next/image'));

/**
 * `next/image`, with its client code kept out of the first-load bundle
 * (Section 12.1). The image is still rendered on the server, so it shows (and
 * is optimised, responsive and lazy) before any JavaScript runs; the component
 * code only downloads on pages that actually render a cover. The fallback
 * holds the space during client-side navigation.
 */
export function CoverImage({ alt, ...props }: ImageProps) {
  return (
    <Suspense fallback={<span className="absolute inset-0 bg-surface" />}>
      <Image alt={alt} {...props} />
    </Suspense>
  );
}
