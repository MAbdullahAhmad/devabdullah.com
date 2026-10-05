'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { CaseStudyMeta } from '@/lib/case-studies';
import { MARK_PATHS, MARK_VIEWBOX } from '@/lib/brand-mark';
import type { MyMacData } from './types';
import styles from './my-mac.module.css';

/*
 * A zsh-style terminal for exploring the portfolio. Nothing runs on a real
 * machine: commands read a small virtual file system built from the page's
 * public data (projects, profile, skills), and `open` navigates the site.
 */

const USER = 'macyy';
const HOST = 'devabdullah';
const HOME = ['Users', USER];

interface FileNode {
  type: 'file';
  /** Text for `cat`; binary files leave it out. */
  lines?: string[];
  /** Where `open` goes. */
  href?: string;
  kind?: string;
}
interface DirNode {
  type: 'dir';
  children: Record<string, Node>;
  href?: string;
}
type Node = FileNode | DirNode;

const projectHref = (project: CaseStudyMeta) =>
  project.caseStudy === false ? '/work' : `/work/${project.slug}`;

function buildFs(data: MyMacData): DirNode {
  const projects: Record<string, Node> = {};
  for (const project of data.projects) {
    const files: Record<string, Node> = {
      'README.md': {
        type: 'file',
        href: projectHref(project),
        lines: [
          `# ${project.title}`,
          '',
          project.summary,
          '',
          `Type:   ${project.type}`,
          `Stack:  ${project.stack.join(', ')}`,
          ...(project.year ? [`Year:   ${project.year}`] : []),
          ...(project.url ? [`Live:   ${project.url}`] : []),
          '',
          `Run \`open .\` to read the ${project.caseStudy === false ? 'details' : 'case study'}.`,
        ],
      },
    };
    if (project.url) {
      files['live-site.webloc'] = {
        type: 'file',
        href: project.url,
        kind: 'Web location',
      };
    }
    projects[project.slug] = {
      type: 'dir',
      href: projectHref(project),
      children: files,
    };
  }

  const home: DirNode = {
    type: 'dir',
    href: '/',
    children: {
      projects: { type: 'dir', href: '/work', children: projects },
      'about.md': {
        type: 'file',
        href: '/about',
        lines: [
          `# ${data.name}`,
          data.role,
          '',
          data.summary,
          '',
          `Based in ${data.location}.`,
          ...(data.availability ? [data.availability] : []),
        ],
      },
      'experience.md': {
        type: 'file',
        href: '/about',
        lines: data.experience.flatMap((role) => [
          `## ${role.title} · ${role.companyShort ?? role.company}`,
          `${role.start} — ${role.end} · ${role.location}`,
          '',
        ]),
      },
      'skills.md': {
        type: 'file',
        href: '/about',
        lines: data.skills.flatMap((group) => [
          `${group.label}:`,
          `  ${group.items.join(', ')}`,
        ]),
      },
      'cv.pdf': { type: 'file', href: '/cv', kind: 'PDF document' },
      'book-a-call.app': {
        type: 'file',
        href: '/book-a-call',
        kind: 'Application',
      },
      'contact.app': { type: 'file', href: '/contact', kind: 'Application' },
    },
  };
  return {
    type: 'dir',
    children: { Users: { type: 'dir', children: { [USER]: home } } },
  };
}

/** Resolve `input` against `cwd` (absolute segments). Null if invalid. */
function resolve(cwd: string[], input: string): string[] | null {
  const raw = input.trim();
  let parts = raw.startsWith('/')
    ? []
    : raw === '~' || raw.startsWith('~/')
      ? [...HOME]
      : [...cwd];
  const rest = raw.replace(/^~\/?/, '').split('/');
  for (const part of rest) {
    if (!part || part === '.') continue;
    if (part === '..') parts = parts.slice(0, -1);
    else parts.push(part);
  }
  return parts;
}

function nodeAt(root: DirNode, path: string[]): Node | null {
  let node: Node = root;
  for (const part of path) {
    if (node.type !== 'dir') return null;
    const next: Node | undefined = node.children[part];
    if (!next) return null;
    node = next;
  }
  return node;
}

/** zsh's `%1~`: `~` at home, otherwise the current folder's name. */
function shortDir(path: string[]) {
  if (path.join('/') === HOME.join('/')) return '~';
  return path.length ? path[path.length - 1] : '/';
}

function displayPath(path: string[]) {
  const home = HOME.join('/');
  const full = path.join('/');
  if (full === home) return '~';
  if (full.startsWith(`${home}/`)) return `~/${full.slice(home.length + 1)}`;
  return `/${full}`;
}

const COMMANDS = [
  'cat',
  'cd',
  'clear',
  'curl',
  'date',
  'echo',
  'exit',
  'find',
  'grep',
  'help',
  'history',
  'ls',
  'neofetch',
  'open',
  'pwd',
  'search',
  'tree',
  'whoami',
];

interface Entry {
  id: number;
  cwd: string[];
  input: string;
  output: ReactNode;
}

export function Terminal({ data }: { data: MyMacData }) {
  const router = useRouter();
  const fs = useMemo(() => buildFs(data), [data]);
  const [cwd, setCwd] = useState<string[]>([...HOME]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [lastLogin] = useState(() =>
    new Date().toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
  );
  const field = useRef<HTMLInputElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  // The window focuses its close button first; a terminal opens ready to type.
  useEffect(() => {
    const id = setTimeout(() => field.current?.focus(), 60);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = screen.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const go = (href: string) => {
    if (/^https?:/.test(href)) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      setTimeout(() => router.push(href), 450);
    }
  };

  const listing = (dir: DirNode, long: boolean) => {
    const names = Object.keys(dir.children).sort();
    if (!names.length) return null;
    return (
      <span className={long ? styles.termLong : styles.termGrid}>
        {names.map((name) => {
          const node = dir.children[name];
          const isDir = node.type === 'dir';
          return (
            <span key={name}>
              {long && (
                <span className={styles.termDim}>
                  {isDir ? 'drwxr-xr-x' : '-rw-r--r--'} {USER} staff{' '}
                </span>
              )}
              <span className={isDir ? styles.termDir : undefined}>
                {name}
                {isDir ? '/' : ''}
              </span>
            </span>
          );
        })}
      </span>
    );
  };

  const tree = (dir: DirNode, prefix = ''): string[] =>
    Object.keys(dir.children)
      .sort()
      .flatMap((name, index, all) => {
        const last = index === all.length - 1;
        const node = dir.children[name];
        const line = `${prefix}${last ? '└── ' : '├── '}${name}${node.type === 'dir' ? '/' : ''}`;
        return node.type === 'dir'
          ? [line, ...tree(node, `${prefix}${last ? '    ' : '│   '}`)]
          : [line];
      });

  const search = (query: string): ReactNode => {
    const q = query.toLowerCase();
    const hits = data.projects.filter((project) =>
      [project.title, project.summary, project.type, ...project.stack]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
    if (!hits.length) return `No projects match “${query}”.`;
    return (
      <>
        {hits.map((project) => (
          <span key={project.slug} className={styles.termLine}>
            <span className={styles.termDir}>~/projects/{project.slug}/</span>{' '}
            <span className={styles.termDim}>— {project.title}</span>
          </span>
        ))}
        <span className={styles.termDim}>
          Tip: cd into one, then run `open .`
        </span>
      </>
    );
  };

  const run = async (line: string): Promise<ReactNode> => {
    const [command = '', ...args] = line.trim().split(/\s+/);
    const flags = args.filter((arg) => arg.startsWith('-')).join('');
    const target = args.find((arg) => !arg.startsWith('-'));
    const rest = args.join(' ');

    switch (command) {
      case '':
        return null;
      case 'help':
        return (
          <span className={styles.termHelp}>
            {[
              ['ls [path]', 'list files (-l for details)'],
              ['cd <path>', 'change folder (.., ~, projects/…)'],
              ['pwd', 'print the current folder'],
              ['cat <file>', 'read a file'],
              ['open <path>', 'open it on the site (`open .` = here)'],
              ['search <text>', 'find projects by name or stack'],
              ['tree', 'show everything below here'],
              ['curl /api/me', 'my profile as JSON'],
              ['whoami · neofetch', 'who you are talking to'],
              ['clear · history', 'tidy up (Ctrl+L also clears)'],
            ].map(([name, text]) => (
              <span key={name}>
                <span className={styles.termCmd}>{name}</span>
                <span className={styles.termDim}>{text}</span>
              </span>
            ))}
          </span>
        );
      case 'pwd':
        return `/${cwd.join('/')}`;
      case 'whoami':
        return `${data.name} — ${data.role}`;
      case 'date':
        return new Date().toString();
      case 'echo':
        return rest;
      case 'history':
        return history
          .map((item, i) => `${String(i + 1).padStart(5)}  ${item}`)
          .join('\n');
      case 'ls': {
        const path = target ? resolve(cwd, target) : cwd;
        const node = path && nodeAt(fs, path);
        if (!node) return `ls: ${target}: No such file or directory`;
        if (node.type === 'file') return target;
        return listing(node, flags.includes('l'));
      }
      case 'cd': {
        const path = resolve(cwd, target ?? '~');
        const node = path && nodeAt(fs, path);
        if (!path || !node) return `cd: no such file or directory: ${target}`;
        if (node.type !== 'dir') return `cd: not a directory: ${target}`;
        setCwd(path);
        return null;
      }
      case 'cat': {
        if (!target) return 'usage: cat <file>';
        const path = resolve(cwd, target);
        const node = path && nodeAt(fs, path);
        if (!node) return `cat: ${target}: No such file or directory`;
        if (node.type === 'dir') return `cat: ${target}: Is a directory`;
        if (!node.lines)
          return `cat: ${target}: ${node.kind ?? 'binary file'} — try \`open ${target}\``;
        return node.lines.join('\n');
      }
      case 'open': {
        if (!target) return 'usage: open <path>   (try `open .`)';
        if (/^https?:\/\//.test(target)) {
          go(target);
          return `Opening ${target}…`;
        }
        const path = resolve(cwd, target);
        const node = path && nodeAt(fs, path);
        if (!node)
          return `The file ${displayPath(path ?? cwd)}/${target} does not exist.`;
        if (!node.href) return `open: nothing to open at ${target}`;
        go(node.href);
        return (
          <span className={styles.termDim}>
            Opening{' '}
            {node.href.startsWith('http')
              ? node.href
              : `devabdullah.com${node.href}`}
            …
          </span>
        );
      }
      case 'find':
      case 'search':
      case 'grep':
        if (!rest) return `usage: ${command} <text>`;
        return search(rest.replace(/^["']|["']$/g, ''));
      case 'tree': {
        const node = nodeAt(fs, cwd);
        if (!node || node.type !== 'dir') return null;
        return ['.', ...tree(node)].join('\n');
      }
      case 'curl': {
        if (!target || !/(^|\/)api\/me/.test(target))
          return `curl: only /api/me is reachable from here`;
        try {
          const response = await fetch('/api/me?pretty=1');
          if (!response.ok) throw new Error();
          return JSON.stringify(await response.json(), null, 2);
        } catch {
          return 'curl: (7) Failed to connect — try again';
        }
      }
      case 'neofetch':
        return (
          <span className={styles.termFetch}>
            <svg
              viewBox={MARK_VIEWBOX}
              className={styles.termLogo}
              aria-hidden
              focusable="false"
            >
              {MARK_PATHS.ink.map((d) => (
                <path key={d} d={d} fill="currentColor" />
              ))}
              <path d={MARK_PATHS.accent} fill="var(--term-accent)" />
            </svg>
            <span>
              <span className={styles.termCmd}>
                {USER}@{HOST}
              </span>
              {'\n'}
              {[
                ['Name', data.name],
                ['Role', data.role],
                ['Location', data.location],
                ['Projects', String(data.projects.length)],
                ['Shell', 'zsh (portfolio edition)'],
              ]
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')}
            </span>
          </span>
        );
      case 'exit':
      case 'logout':
        return '[Process completed]';
      case 'sudo':
        return `${USER} is not in the sudoers file. This incident will be reported.`;
      case 'rm':
      case 'mv':
      case 'touch':
      case 'mkdir':
        return `${command}: read-only file system`;
      default:
        return `zsh: command not found: ${command}`;
    }
  };

  const submit = async () => {
    const line = input;
    const at = cwd;
    setInput('');
    setCursor(null);
    if (line.trim()) setHistory((items) => [...items, line.trim()]);
    if (line.trim() === 'clear') {
      setEntries([]);
      return;
    }
    const output = await run(line);
    setEntries((items) => [
      ...items,
      { id: nextId.current++, cwd: at, input: line, output },
    ]);
  };

  const complete = () => {
    const tokens = input.split(' ');
    const last = tokens[tokens.length - 1];
    let options: string[];
    let base = '';
    if (tokens.length === 1) {
      options = COMMANDS.filter((command) => command.startsWith(last));
    } else {
      const slash = last.lastIndexOf('/');
      base = slash >= 0 ? last.slice(0, slash + 1) : '';
      const stem = last.slice(slash + 1);
      const dirPath = base ? resolve(cwd, base) : cwd;
      const dir = dirPath && nodeAt(fs, dirPath);
      options =
        dir && dir.type === 'dir'
          ? Object.keys(dir.children)
              .filter((name) => name.startsWith(stem))
              .map((name) =>
                dir.children[name].type === 'dir' ? `${name}/` : name,
              )
          : [];
    }
    if (options.length === 1) {
      tokens[tokens.length - 1] =
        base + options[0] + (tokens.length === 1 ? ' ' : '');
      setInput(tokens.join(' '));
    } else if (options.length > 1) {
      setEntries((items) => [
        ...items,
        {
          id: nextId.current++,
          cwd,
          input,
          output: (
            <span className={styles.termGrid}>
              {options.map((o) => (
                <span key={o}>{o}</span>
              ))}
            </span>
          ),
        },
      ]);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void submit();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      complete();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (!history.length) return;
      const up = event.key === 'ArrowUp';
      const next =
        cursor === null
          ? up
            ? history.length - 1
            : null
          : up
            ? Math.max(0, cursor - 1)
            : cursor + 1 >= history.length
              ? null
              : cursor + 1;
      setCursor(next);
      setInput(next === null ? '' : history[next]);
    } else if (event.key === 'Escape' && input) {
      setInput('');
      setCursor(null);
    } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      setEntries([]);
    } else if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      setEntries((items) => [
        ...items,
        { id: nextId.current++, cwd, input: `${input}^C`, output: null },
      ]);
      setInput('');
    }
  };

  const prompt = (path: string[]) => (
    <span className={styles.termPrompt} aria-hidden>
      {USER}@{HOST} <span className={styles.termPath}>{shortDir(path)}</span> %
    </span>
  );

  return (
    <div
      ref={screen}
      className={styles.terminal}
      onMouseUp={() => {
        if (!window.getSelection()?.toString()) field.current?.focus();
      }}
    >
      <p className={styles.termDim}>Last login: {lastLogin} on ttys001</p>
      <p>
        Welcome to <span className={styles.termCmd}>{HOST}</span>. Type{' '}
        <span className={styles.termCmd}>help</span> to see the commands, or try{' '}
        <span className={styles.termCmd}>ls projects</span>.
      </p>
      <div role="log" aria-live="polite" aria-label="Terminal output">
        {entries.map((entry) => (
          <div key={entry.id} className={styles.termEntry}>
            <div>
              {prompt(entry.cwd)} {entry.input}
            </div>
            {entry.output !== null && entry.output !== '' && (
              <div className={styles.termOut}>{entry.output}</div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.termInputRow}>
        {prompt(cwd)}
        <input
          ref={field}
          data-terminal-input
          className={styles.termInput}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          aria-label={`Terminal command, in ${displayPath(cwd)}`}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
