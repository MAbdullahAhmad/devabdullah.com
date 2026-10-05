import Image from 'next/image';
import { cn } from '@/lib/cn';
import { BrowserFrame } from '@/components/work/BrowserFrame';

interface FigureProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  /** Wrap screenshots in the shared browser frame. */
  framed?: boolean;
  className?: string;
}

/**
 * Image + caption for case studies (Section 7.2). `next/image` serves
 * AVIF/WebP, lazy-loads, and reserves space via width/height (no layout
 * shift).
 */
export function Figure({
  src,
  alt,
  width,
  height,
  caption,
  framed = false,
  className,
}: FigureProps) {
  const image = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes="(min-width: 1024px) 720px, 100vw"
      className="h-auto w-full"
    />
  );

  return (
    <figure
      data-reveal="clip"
      className={cn('mt-8 flex flex-col gap-3', className)}
    >
      {framed ? (
        <BrowserFrame>{image}</BrowserFrame>
      ) : (
        <div className="overflow-hidden rounded-md border border-border">
          {image}
        </div>
      )}
      {caption && (
        <figcaption className="text-body-s text-text-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
