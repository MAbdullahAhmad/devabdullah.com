'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Braces,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  Home,
  Mail,
  MessageSquare,
  SunMoon,
  User,
  Briefcase,
  CalendarDays,
} from 'lucide-react';
import type { CaseStudyMeta } from '@/lib/case-studies';
import { profile } from '@/content/profile';
import { copyText } from '@/lib/clipboard';
import {
  COMMAND_MENU_EVENT,
  getCommandMenuReturnFocus,
} from '@/lib/command-menu';
import { switchTheme } from '@/lib/theme-transition';

const PAGES = [
  { label: 'Home', href: '/', Icon: Home },
  { label: 'Services', href: '/services', Icon: Briefcase },
  { label: 'Book a call', href: '/book-a-call', Icon: CalendarDays },
  { label: 'Work', href: '/work', Icon: FolderOpen },
  { label: 'About', href: '/about', Icon: User },
  { label: 'CV', href: '/cv', Icon: FileText },
  { label: 'My Mac', href: '/my-mac', Icon: Home },
  { label: 'Contact', href: '/contact', Icon: MessageSquare },
];

const item =
  'flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-body-s text-text-muted data-[selected=true]:bg-surface data-[selected=true]:text-text';
const group =
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:text-text-subtle';

/**
 * Stricter than cmdk's default fuzzy match (which ranked an unrelated result like "Project Management
 * System" first for "email"): every typed word must appear in the label or
 * keywords; word-prefix matches rank highest.
 */
function filter(value: string, search: string, keywords: string[] = []) {
  const haystack = `${value} ${keywords.join(' ')}`.toLowerCase();
  const words = haystack.split(/[^a-z0-9/]+/);
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 1;

  let score = 0;
  for (const term of terms) {
    if (words.some((word) => word.startsWith(term))) score += 1;
    else if (haystack.includes(term)) score += 0.5;
    else return 0;
  }
  return score / terms.length;
}

function Item({
  value,
  onSelect,
  icon,
  children,
  hint,
  keywords,
}: {
  value: string;
  onSelect: () => void;
  icon: ReactNode;
  children: ReactNode;
  hint?: string;
  keywords?: string[];
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      keywords={keywords}
      className={item}
    >
      <span className="text-text-subtle" aria-hidden>
        {icon}
      </span>
      <span className="flex-1">{children}</span>
      {hint && (
        <span className="font-mono text-label text-text-subtle">{hint}</span>
      )}
    </Command.Item>
  );
}

/**
 * ⌘K command menu (Blueprint Section 8.4): fuzzy search across pages,
 * projects, actions and socials. Built on cmdk (shadcn's Command base) inside
 * a Radix Dialog — focus trap, Esc, arrow keys, Enter. Opens with ⌘K / Ctrl K
 * or any `openCommandMenu()` call.
 */
export function CommandMenu({
  projects,
  defaultOpen = false,
}: {
  projects: CaseStudyMeta[];
  /** Open immediately — used when lazily loaded by the first request. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [notice, setNotice] = useState<string | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (!open) {
          returnFocus.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
        }
        setOpen((value) => !value);
      }
    };
    const onOpen = () => {
      returnFocus.current = getCommandMenuReturnFocus();
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(COMMAND_MENU_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(COMMAND_MENU_EVENT, onOpen);
    };
  }, [open]);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  const go = (href: string) => run(() => router.push(href));
  const openExternal = (href: string) =>
    run(() => window.open(href, '_blank', 'noopener,noreferrer'));

  const copyEmail = async () => {
    const ok = await copyText(profile.contact.email);
    setNotice(ok ? 'Email copied' : 'Copy blocked — email shown in the footer');
    setTimeout(() => setNotice(null), 2000);
    setOpen(false);
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed left-1/2 top-[14vh] z-50 w-[min(92vw,36rem)] -translate-x-1/2 overflow-hidden rounded-lg border border-border-strong bg-bg-elevated shadow-[var(--shadow-floating)]"
            aria-describedby={undefined}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              const target = returnFocus.current ?? getCommandMenuReturnFocus();
              if (target?.isConnected) target.focus();
            }}
          >
            <Dialog.Title className="sr-only">Command menu</Dialog.Title>
            <Command label="Command menu" filter={filter}>
              <Command.Input
                placeholder="Search pages, projects, actions…"
                className="w-full border-b border-border bg-transparent px-5 py-4 text-body text-text placeholder:text-text-subtle focus:outline-none"
              />
              <Command.List className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
                <Command.Empty className="px-3 py-8 text-center text-body-s text-text-muted">
                  No results. Try “work”, “cv” or “email”.
                </Command.Empty>

                <Command.Group heading="Pages" className={group}>
                  {PAGES.map(({ label, href, Icon }) => (
                    <Item
                      key={href}
                      value={label}
                      onSelect={() => go(href)}
                      icon={<Icon size={16} strokeWidth={1.5} />}
                      hint={href}
                    >
                      {label}
                    </Item>
                  ))}
                </Command.Group>

                {projects.length > 0 && (
                  <Command.Group heading="Projects" className={group}>
                    {projects.map((project) => (
                      <Item
                        key={project.slug}
                        value={project.title}
                        onSelect={() => go(`/work/${project.slug}`)}
                        icon={<FolderOpen size={16} strokeWidth={1.5} />}
                        hint={project.type}
                        keywords={project.stack}
                      >
                        {project.title}
                      </Item>
                    ))}
                  </Command.Group>
                )}

                <Command.Group heading="Actions" className={group}>
                  <Item
                    value="Copy email"
                    onSelect={copyEmail}
                    icon={<Copy size={16} strokeWidth={1.5} />}
                    keywords={['email', 'contact', 'mail']}
                  >
                    Copy email
                  </Item>
                  <Item
                    value="View download CV"
                    onSelect={() => go('/cv')}
                    icon={<FileText size={16} strokeWidth={1.5} />}
                    keywords={['resume', 'pdf', 'download']}
                  >
                    View / download CV
                  </Item>
                  <Item
                    value="Toggle theme"
                    onSelect={() =>
                      run(() =>
                        switchTheme(
                          resolvedTheme === 'dark' ? 'light' : 'dark',
                          setTheme,
                        ),
                      )
                    }
                    icon={<SunMoon size={16} strokeWidth={1.5} />}
                    keywords={['dark', 'light', 'ink', 'paper', 'mode']}
                  >
                    Toggle theme
                  </Item>
                  <Item
                    value="Open /api/me"
                    onSelect={() => openExternal('/api/me?pretty=1')}
                    icon={<Braces size={16} strokeWidth={1.5} />}
                    hint="JSON"
                    keywords={['api', 'json', 'endpoint']}
                  >
                    Open /api/me
                  </Item>
                </Command.Group>

                <Command.Group heading="Elsewhere" className={group}>
                  <Item
                    value="LinkedIn"
                    onSelect={() => openExternal(profile.contact.linkedin)}
                    icon={<ExternalLink size={16} strokeWidth={1.5} />}
                    hint="↗"
                  >
                    LinkedIn
                  </Item>
                  <Item
                    value="GitHub"
                    onSelect={() => openExternal(profile.contact.github)}
                    icon={<ExternalLink size={16} strokeWidth={1.5} />}
                    hint="↗"
                  >
                    GitHub
                  </Item>
                  <Item
                    value={`Email ${profile.contact.email}`}
                    onSelect={() =>
                      run(
                        () =>
                          (window.location.href = `mailto:${profile.contact.email}`),
                      )
                    }
                    icon={<Mail size={16} strokeWidth={1.5} />}
                  >
                    Email {profile.contact.email}
                  </Item>
                </Command.Group>
              </Command.List>

              <div className="flex items-center gap-4 border-t border-border px-4 py-2 font-mono text-[0.6875rem] text-text-subtle">
                <span>↑↓ navigate</span>
                <span>↵ open</span>
                <span>esc close</span>
              </div>
            </Command>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Transient confirmation for actions that close the menu. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      >
        {notice && (
          <span className="rounded-pill border border-border-strong bg-bg-elevated px-4 py-2 font-mono text-label text-text shadow-[var(--shadow-floating)]">
            {notice}
          </span>
        )}
      </div>
    </>
  );
}
