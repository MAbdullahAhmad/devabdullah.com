'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    /** Console easter egg: opens a pre-filled email (Blueprint Section 8.5). */
    hire?: () => string;
  }
}

let printed = false;

/**
 * DevTools signature (Blueprint Section 8.5): once per page load, production
 * only, print the logo as text art and an invitation, and define `hire()`.
 * Renders nothing. Takes only the two strings it prints, so the full profile
 * stays out of the client bundle.
 */
export function ConsoleSignature({
  email,
  firstName,
}: {
  email: string;
  firstName: string;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || printed) return;
    printed = true;

    const band = 'font-family: monospace; font-size: 14px; line-height: 1;';

    console.log(
      '%c▬▬▬▬▬▬▬▬\n%c▬▬▬▬▬▬▬▬\n%c▬▬▬▬▬▬▬▬',
      `${band} color: #9a9aa3;`,
      `${band} color: #2f6bff;`,
      `${band} color: #9a9aa3;`,
    );
    console.log(
      '%cThe%cMac%cStack',
      'font: 600 16px sans-serif; color: inherit;',
      'font: 700 16px sans-serif; color: #2f6bff;',
      'font: 600 16px sans-serif; color: inherit;',
    );
    console.log(
      `%cLooking under the hood? You're my kind of person. → ${email} · Type hire() to say hi.`,
      'font: 13px monospace; color: inherit;',
    );

    window.hire = () => {
      const subject = encodeURIComponent('Found you in the console');
      const body = encodeURIComponent(
        `Hi ${firstName},\n\nI found your site's console message and wanted to say hi.\n\n`,
      );
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      return 'Opening your email client…';
    };
  }, [email, firstName]);

  return null;
}
