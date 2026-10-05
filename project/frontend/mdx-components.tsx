import {
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import type { MDXComponents } from 'mdx/types';
import { headingId } from '@/lib/heading-id';
import { ArchitectureDiagram } from '@/components/work/ArchitectureDiagram';
import { BrowserFrame } from '@/components/work/BrowserFrame';
import { Callout } from '@/components/work/Callout';
import { CodeBlock } from '@/components/work/CodeBlock';
import { Figure } from '@/components/work/Figure';
import { Gallery } from '@/components/work/Gallery';
import { SchemaDiagram } from '@/components/work/SchemaDiagram';

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  return '';
}

/**
 * Token-styled prose for every MDX file (case studies). Required by
 * `@next/mdx` in the App Router. `h2`s get stable ids so the table of contents
 * (task 4.2) can link to them. Fenced code becomes a `CodeBlock`, and the
 * case-study components (Section 7.2) are available without imports.
 */
/** Fenced ```lang blocks arrive as <pre><code className="language-x">…</code></pre>. */
function FencedCode({ children }: ComponentPropsWithoutRef<'pre'>) {
  if (isValidElement<{ className?: string; children?: ReactNode }>(children)) {
    const lang = children.props.className?.replace('language-', '') ?? 'text';
    return <CodeBlock code={textOf(children.props.children)} lang={lang} />;
  }
  return <pre>{children}</pre>;
}

const components: MDXComponents = {
  h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <h2
      id={headingId(textOf(children))}
      className="mt-20 scroll-mt-28 text-balance text-display-m text-text first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: (props: ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="mt-10 text-h3 text-text" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<'p'>) => (
    <p className="mt-5 text-pretty text-body text-text-muted" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<'ul'>) => (
    <ul className="mt-5 flex flex-col gap-2" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<'ol'>) => (
    <ol
      className="mt-5 flex list-decimal flex-col gap-2 pl-5 marker:font-mono marker:text-text-subtle"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<'li'>) => (
    <li
      className="relative pl-5 text-body text-text-muted before:absolute before:left-0 before:top-[0.8em] before:size-1 before:rounded-pill before:bg-border-strong [ol_&]:pl-0 [ol_&]:before:hidden"
      {...props}
    />
  ),
  a: (props: ComponentPropsWithoutRef<'a'>) => (
    <a
      className="text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2"
      {...props}
    />
  ),
  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold text-text" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="mt-8 border-l-2 border-accent pl-6 text-body-l text-text"
      {...props}
    />
  ),
  hr: () => <hr className="my-16 border-border" />,
  code: (props: ComponentPropsWithoutRef<'code'>) => (
    <code
      className="rounded-sm border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-text"
      {...props}
    />
  ),
};

/** Custom components available in every MDX file without imports. */
const custom = {
  ArchitectureDiagram,
  BrowserFrame,
  Callout,
  CodeBlock,
  Figure,
  Gallery,
  SchemaDiagram,
};

export function useMDXComponents(): MDXComponents {
  return { ...components, ...custom, pre: FencedCode };
}
