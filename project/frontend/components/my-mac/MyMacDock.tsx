import Link from 'next/link';
import type { MouseEvent } from 'react';
import { AppIcon, type AppIconName } from './AppIcon';
import type { MyMacData, PanelId, PanelSelection } from './types';
import styles from './my-mac.module.css';

export function MyMacDock({
  data,
  open,
  active,
  minimized,
}: {
  data: MyMacData;
  open: (event: MouseEvent<HTMLAnchorElement>, panel: PanelSelection) => void;
  active?: PanelId;
  minimized: boolean;
}) {
  const app = (icon: AppIconName, label: string, panel: PanelSelection) => (
    <a
      href={panel.href}
      aria-label={label}
      aria-haspopup="dialog"
      className={styles.dockItem}
      data-running={
        active === panel.id || (panel.id === 'work' && active === 'project')
      }
      data-minimized={minimized}
      onClick={(event) => open(event, panel)}
    >
      <span className={styles.dockTile}>
        <AppIcon name={icon} />
      </span>
      <span className={styles.dockLabel} aria-hidden>
        {label}
      </span>
    </a>
  );
  return (
    <nav className={styles.dock} aria-label="My Mac dock">
      {app('finder', 'Finder', { id: 'work', title: 'Work', href: '/work' })}
      {app('apps', 'Applications', {
        id: 'apps',
        title: 'Applications',
        href: '/work',
      })}
      <Link
        prefetch={false}
        href="/"
        aria-label="Back to portfolio"
        className={styles.dockItem}
      >
        <span className={styles.dockTile}>
          <AppIcon name="safari" />
        </span>
        <span className={styles.dockLabel} aria-hidden>
          Safari · Portfolio
        </span>
      </Link>
      {app('contacts', 'About Me', {
        id: 'about',
        title: 'About Me',
        href: '/about',
      })}
      {app('notes', 'Notes', { id: 'notes', title: 'Notes', href: '/about' })}
      {app('terminal', 'Terminal', {
        id: 'terminal',
        title: 'Terminal — zsh',
        href: '/work',
      })}
      <span className={styles.dockDivider} aria-hidden />
      {data.instagram && (
        <a
          href={data.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.dockItem}
          aria-label="Instagram (opens in a new tab)"
        >
          <span className={styles.dockTile}>
            <AppIcon name="instagram" />
          </span>
          <span className={styles.dockLabel} aria-hidden>
            Instagram
          </span>
        </a>
      )}
      {data.github && (
        <a
          href={data.github}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.dockItem}
          aria-label="GitHub (opens in a new tab)"
        >
          <span className={styles.dockTile}>
            <AppIcon name="github" />
          </span>
          <span className={styles.dockLabel} aria-hidden>
            GitHub
          </span>
        </a>
      )}
      {data.linkedin && (
        <a
          href={data.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.dockItem}
          aria-label="LinkedIn (opens in a new tab)"
        >
          <span className={styles.dockTile}>
            <AppIcon name="linkedin" />
          </span>
          <span className={styles.dockLabel} aria-hidden>
            LinkedIn
          </span>
        </a>
      )}
      <a href="/contact" aria-label="Contact" className={styles.dockItem}>
        <span className={styles.dockTile}>
          <AppIcon name="mail" />
        </span>
        <span className={styles.dockLabel} aria-hidden>
          Mail · Contact
        </span>
      </a>
      <span className={styles.dockDivider} aria-hidden />
      {app('settings', 'System Settings', {
        id: 'settings',
        title: 'System Settings',
        href: '/my-mac',
      })}
    </nav>
  );
}
