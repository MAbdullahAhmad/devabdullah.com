'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Braces,
  Copy,
  FolderOpen,
  MapPin,
  Search,
} from 'lucide-react';
import { ThemeToggle } from '@/components/global/ThemeToggle';
import { AppIcon, type AppIconName } from './AppIcon';
import { ProjectPreview } from '@/components/work/ProjectPreview';
import { copyText } from '@/lib/clipboard';
import { Terminal } from './Terminal';
import type { MyMacData, PanelProps } from './types';
import styles from './my-mac.module.css';

function About({ data }: { data: MyMacData }) {
  return (
    <div className={styles.panel}>
      <div className={styles.profileMark}>
        <AppIcon name="contacts" />
      </div>
      <span className={styles.eyebrow}>The person behind the stack</span>
      <h2>{data.name}</h2>
      <p className={styles.role}>{data.role}</p>
      <p>{data.summary}</p>
      <div className={styles.facts}>
        <span>
          <MapPin aria-hidden />
          {data.location}
        </span>
        {data.availability && <span>{data.availability}</span>}
      </div>
      <a className={styles.action} href="/about">
        Read my story <ArrowUpRight aria-hidden />
      </a>
    </div>
  );
}

function Notes({ data, noteTopic: topic, setNoteTopic: setTopic }: PanelProps) {
  return (
    <div className={styles.notebook}>
      <nav className={styles.topics} aria-label="Note topics">
        {['About', 'Experience', 'Skills'].map((name) => (
          <button
            key={name}
            aria-pressed={topic === name}
            aria-controls="my-mac-note"
            onClick={() => setTopic(name)}
          >
            <span>{name}</span>
            <small>
              {name === 'About'
                ? 'A little context'
                : name === 'Experience'
                  ? 'The journey so far'
                  : 'Tools of the trade'}
            </small>
          </button>
        ))}
      </nav>
      <section
        id="my-mac-note"
        className={styles.note}
        aria-label={topic}
        tabIndex={0}
      >
        <span className={styles.eyebrow}>From my profile</span>
        <h2>{topic}</h2>
        {topic === 'About' ? (
          <>
            <p>{data.summary}</p>
            <a className={styles.textLink} href="/about">
              Full story <ArrowUpRight aria-hidden />
            </a>
          </>
        ) : topic === 'Experience' ? (
          data.experience.map((role) => (
            <article
              className={styles.noteEntry}
              key={`${role.company}-${role.start}`}
            >
              <span className={styles.eyebrow}>
                {role.start} — {role.end}
              </span>
              <h3>{role.title}</h3>
              <p>
                {role.companyShort ?? role.company} · {role.location}
              </p>
              <ul>
                {role.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))
        ) : (
          data.skills.map((group) => (
            <article className={styles.noteEntry} key={group.label}>
              <h3>{group.label}</h3>
              <ul className={styles.tags}>
                {group.items.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function ApiProfile() {
  const [notice, setNotice] = useState('');
  const [json, setJson] = useState<string | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/me?pretty=1', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Profile unavailable');
        const value: unknown = await response.json();
        setJson(JSON.stringify(value, null, 2));
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, []);
  return (
    <div className={styles.panel}>
      <div className={styles.apiBar}>
        <span>
          <Braces aria-hidden />
          GET /api/me
        </span>
        <button
          className={styles.textLink}
          disabled={!json}
          onClick={async () =>
            setNotice(
              (await copyText(json ?? ''))
                ? 'JSON copied.'
                : 'Copy unavailable. Select the JSON below to copy it.',
            )
          }
        >
          <Copy aria-hidden />
          Copy JSON
        </button>
      </div>
      <p>Same person. Different format.</p>
      <p role="status">{notice}</p>
      {error && (
        <p role="alert">
          The profile couldn’t load. Open the API using the link below.
        </p>
      )}
      {!json && !error && <p role="status">Loading public profile…</p>}
      {json && (
        <pre
          className={styles.json}
          tabIndex={0}
          aria-label="Public profile JSON"
        >
          <code>{json}</code>
        </pre>
      )}
    </div>
  );
}

function Applications({ open, data }: PanelProps) {
  const [query, setQuery] = useState('');
  const entries: {
    icon: AppIconName;
    label: string;
    href: string;
    panel?: PanelProps['selection'];
    external?: boolean;
  }[] = [
    {
      icon: 'finder',
      label: 'Finder',
      href: '/work',
      panel: { id: 'work', title: 'Work', href: '/work' },
    },
    {
      icon: 'contacts',
      label: 'About Me',
      href: '/about',
      panel: { id: 'about', title: 'About Me', href: '/about' },
    },
    {
      icon: 'notes',
      label: 'Notes',
      href: '/about',
      panel: { id: 'notes', title: 'Notes', href: '/about' },
    },
    { icon: 'safari', label: 'Portfolio', href: '/' },
    {
      icon: 'terminal',
      label: 'Terminal',
      href: '/work',
      panel: { id: 'terminal', title: 'Terminal — zsh', href: '/work' },
    },
    { icon: 'document', label: 'My CV', href: '/cv' },
    { icon: 'mail', label: 'Contact', href: '/contact' },
    {
      icon: 'settings',
      label: 'System Settings',
      href: '/my-mac',
      panel: { id: 'settings', title: 'System Settings', href: '/my-mac' },
    },
    ...(data.instagram
      ? [
          {
            icon: 'instagram' as const,
            label: 'Instagram',
            href: data.instagram,
            external: true,
          },
        ]
      : []),
    ...(data.github
      ? [
          {
            icon: 'github' as const,
            label: 'GitHub',
            href: data.github,
            external: true,
          },
        ]
      : []),
    ...(data.linkedin
      ? [
          {
            icon: 'linkedin' as const,
            label: 'LinkedIn',
            href: data.linkedin,
            external: true,
          },
        ]
      : []),
  ];
  const filtered = entries.filter((entry) =>
    entry.label.toLowerCase().includes(query.toLowerCase().trim()),
  );
  return (
    <>
      <label className={styles.appSearch}>
        <Search aria-hidden />
        <input
          type="search"
          aria-label="Search applications"
          placeholder="Search applications"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className={styles.applications}>
        {filtered.map((entry) => (
          <a
            key={entry.label}
            className={styles.application}
            href={entry.href}
            target={entry.external ? '_blank' : undefined}
            rel={entry.external ? 'noopener noreferrer' : undefined}
            aria-haspopup={entry.panel ? 'dialog' : undefined}
            onClick={
              entry.panel ? (event) => open(event, entry.panel!) : undefined
            }
          >
            <AppIcon name={entry.icon} />
            <span>{entry.label}</span>
          </a>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className={styles.appEmpty} role="status">
          No applications found.
        </p>
      )}
    </>
  );
}

function Settings({ resetLayout, iconStyle, setIconStyle }: PanelProps) {
  return (
    <div className={styles.panel}>
      <h2>Desktop & appearance</h2>
      <p>Liquid Glass</p>
      <div className={styles.settingsRow}>
        <div>
          App icons
          <small>Choose the Tahoe look for your desktop and dock.</small>
        </div>
        <div
          className={styles.segmented}
          role="group"
          aria-label="App icon appearance"
        >
          <button
            aria-pressed={iconStyle === 'default'}
            onClick={() => setIconStyle('default')}
          >
            Default
          </button>
          <button
            aria-pressed={iconStyle === 'clear'}
            onClick={() => setIconStyle('clear')}
          >
            Clear
          </button>
        </div>
      </div>
      <div className={styles.settingsRow}>
        <div>
          Appearance<small>Switch between light and dark windows.</small>
        </div>
        <ThemeToggle />
      </div>
      <div className={styles.settingsRow}>
        <div>
          Desktop layout
          <small>Put your shortcuts back where they started.</small>
        </div>
        <button className={styles.action} onClick={resetLayout}>
          Reset layout
        </button>
      </div>
      <div className={styles.settingsRow}>
        <div>
          Wallpaper<small>Tahoe · follows appearance</small>
        </div>
        <span className={styles.wallpaperSwatch} aria-hidden />
      </div>
      <p>
        Click an app to open it. Drag desktop icons to arrange them. Use the
        yellow window button to minimize an app, then open it again from the
        dock.
      </p>
    </div>
  );
}

function Finder(props: PanelProps) {
  return (
    <div className={styles.finder}>
      <nav className={styles.finderSidebar} aria-label="Finder favourites">
        <span>Favourites</span>
        <Link prefetch={false} href="/work" aria-current="page">
          <AppIcon name="folder" />
          Work
        </Link>
        <a
          href="/about"
          onClick={(event) =>
            props.open(event, {
              id: 'about',
              title: 'About Me',
              href: '/about',
            })
          }
        >
          <AppIcon name="contacts" />
          About Me
        </a>
        <a href="/cv">
          <AppIcon name="document" />
          My CV
        </a>
        <a href="/contact">
          <AppIcon name="mail" />
          Contact
        </a>
      </nav>
      <div className={styles.finderFiles}>
        {props.data.projects.map((project) => (
          <a
            key={project.slug}
            href={
              project.caseStudy === false ? '/work' : `/work/${project.slug}`
            }
            className={styles.application}
            onClick={(event) =>
              props.open(event, {
                id: 'project',
                title: project.title,
                href:
                  project.caseStudy === false
                    ? '/work'
                    : `/work/${project.slug}`,
                projectSlug: project.slug,
              })
            }
          >
            <AppIcon name="folder" />
            <span>{project.title}</span>
          </a>
        ))}
        {props.data.projects.length === 0 && <p>No projects published yet.</p>}
      </div>
    </div>
  );
}

export function MyMacPanels(props: PanelProps) {
  const { selection, data } = props;
  if (selection.id === 'apps') return <Applications {...props} />;
  if (selection.id === 'settings') return <Settings {...props} />;
  if (selection.id === 'work') return <Finder {...props} />;
  if (selection.id === 'about') return <About data={data} />;
  if (selection.id === 'notes') return <Notes {...props} />;
  if (selection.id === 'api') return <ApiProfile />;
  if (selection.id === 'terminal') return <Terminal data={data} />;
  const featured =
    data.projects.find((project) => project.slug === selection.projectSlug) ??
    data.projects.find((project) => project.featured) ??
    data.projects[0];
  const projects =
    selection.id === 'project' && featured ? [featured] : data.projects;
  return (
    <div className={styles.panel}>
      <span className={styles.eyebrow}>Project overview</span>
      {projects.length === 0 && (
        <p>Project details will appear here when published.</p>
      )}
      {projects.map((project) => (
        <article className={styles.project} key={project.slug}>
          <div className={styles.projectHeading}>
            <FolderOpen aria-hidden />
            <h2>{project.title}</h2>
          </div>
          <p>{project.summary}</p>
          <ul className={styles.tags}>
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <ProjectPreview
            project={project}
            sizes="(min-width: 768px) 640px, 90vw"
          />
          {!project.cover && (
            <p className={styles.caption}>
              Illustrative workflow · real project screenshot pending
            </p>
          )}
          <a
            className={styles.action}
            href={
              project.caseStudy === false ? '/work' : `/work/${project.slug}`
            }
          >
            {project.caseStudy === false
              ? 'View in project list'
              : 'Read case study'}
            <ArrowUpRight aria-hidden />
          </a>
        </article>
      ))}
    </div>
  );
}
