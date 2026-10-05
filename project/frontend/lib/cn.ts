import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge only knows Tailwind's default theme. Without these, custom
 * token classes are misread — e.g. `text-body-s` (a font size) was treated as
 * a colour and dropped when merged with `text-text-muted`. Keep in sync with
 * the `@theme` blocks in `styles/globals.css`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display-xl',
        'display-l',
        'display-m',
        'h3',
        'h4',
        'body-l',
        'body',
        'body-s',
        'label',
        'code',
      ],
      color: [
        'bg',
        'bg-elevated',
        'surface',
        'border',
        'border-strong',
        'text',
        'text-muted',
        'text-subtle',
        'accent',
        'accent-hover',
        'accent-text',
        'accent-soft',
        'success',
        'danger',
      ],
      radius: ['pill'],
      container: ['content', 'reading'],
    },
  },
});

/** Merge class names, resolving Tailwind conflicts so props can override. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
