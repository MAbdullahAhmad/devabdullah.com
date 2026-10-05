import { highlight, isSupportedLang } from '@/lib/shiki';
import { cn } from '@/lib/cn';
import { CopyButton } from '@/components/work/CopyButton';

interface CodeBlockProps {
  code: string;
  lang: string;
  /** Tab label, e.g. `app/Services/OrderLifecycle.php`. */
  filename?: string;
  /** 1-based line numbers to highlight. */
  highlight?: number[];
  className?: string;
}

/**
 * Code snippet for case studies (Section 7.2): build-time Shiki with the custom
 * one-accent theme, a filename tab, a copy button and optional line
 * highlights. Unknown languages render as plain, escaped text.
 */
export async function CodeBlock({
  code,
  lang,
  filename,
  highlight: highlightLines = [],
  className,
}: CodeBlockProps) {
  const source = code.replace(/\n$/, '');
  const html = isSupportedLang(lang)
    ? await highlight(source, lang, highlightLines)
    : null;

  return (
    <figure
      data-reveal="up"
      className={cn(
        'mt-8 overflow-hidden rounded-md border border-border bg-surface',
        className,
      )}
    >
      <figcaption className="flex items-center justify-between gap-4 border-b border-border py-1.5 pl-4 pr-2">
        <span className="truncate font-mono text-label text-text-subtle">
          {filename ?? lang}
        </span>
        <CopyButton text={source} />
      </figcaption>
      {html ? (
        <div
          className="code-block px-4 py-4 [&_pre]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="shiki overflow-x-auto px-4 py-4 text-text-muted">
          <code>{source}</code>
        </pre>
      )}
    </figure>
  );
}
