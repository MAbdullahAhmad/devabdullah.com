import { clsx, type ClassValue } from 'clsx';

/**
 * Joins class names without resolving Tailwind conflicts. tailwind-merge costs
 * about 9 KB gzipped, so client components in the shared first-load bundle
 * (header, nav, hero, project showcase, reveal, quote columns) use this instead of `cn` (Section 12.1). Only use
 * it where a `className` prop can never conflict with the base classes;
 * anywhere a caller may override a class, use `cn`.
 */
export const cx = (...inputs: ClassValue[]) => clsx(inputs);
