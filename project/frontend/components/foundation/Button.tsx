import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'link';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps | 'href'> & {
    href?: undefined;
    /** Shows a spinner and disables the button. Buttons only. */
    loading?: boolean;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<Variant, string> = {
  primary:
    'btn btn-primary rounded-pill bg-accent text-white hover:bg-accent-hover',
  secondary:
    'btn btn-secondary rounded-pill border border-border-strong bg-transparent text-text hover:border-text hover:text-bg focus-visible:text-bg',
  ghost:
    'btn rounded-pill bg-transparent text-text-muted hover:bg-surface hover:text-text',
  link: 'link-draw rounded-sm text-accent-text',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-4 text-body-s',
  md: 'h-10 px-5 text-body-s',
  lg: 'h-12 px-6 text-body',
};

/**
 * Actions and calls to action. Renders a `<button>`, or a Next.js `<Link>`
 * when `href` is set. Every variant is token-only and keyboard-focusable
 * (Section 4.9 focus ring). The `link` variant is an inline text link and
 * ignores `size`.
 *
 * Motion ("Motion system" in `styles/globals.css`): the label (icons included)
 * rolls up and is replaced by a copy on hover or focus, and the button presses
 * in on click. Primary buttons also catch a sweep of light and lean towards
 * the cursor (`data-magnetic`); secondary buttons fill from the bottom. The
 * link variant draws its underline in instead.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  href,
  ...rest
}: ButtonProps) {
  const isLink = variant === 'link';
  const content = isLink ? (
    children
  ) : (
    <span className="btn-roll">
      <span className="btn-roll-a">{children}</span>
      <span aria-hidden className="btn-roll-b">
        {children}
      </span>
    </span>
  );
  const magnetic = variant === 'primary' ? { 'data-magnetic': '' } : {};

  const classes = cn(
    'inline-flex items-center justify-center gap-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    !isLink &&
      'whitespace-nowrap disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    !isLink && sizeClasses[size],
    className,
  );

  if (href !== undefined) {
    return (
      <Link
        href={href}
        className={classes}
        {...magnetic}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </Link>
    );
  }

  const {
    loading = false,
    disabled,
    type = 'button',
    ...buttonRest
  } = rest as ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

  return (
    <button
      type={type}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={classes}
      {...magnetic}
      {...buttonRest}
    >
      {loading && (
        <Loader2
          size={16}
          strokeWidth={1.5}
          className="animate-spin motion-reduce:hidden"
          aria-hidden
        />
      )}
      {content}
    </button>
  );
}
