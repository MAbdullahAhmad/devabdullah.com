import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@/components/global/ThemeProvider';
import { SkipLink } from '@/components/layout/SkipLink';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { StandardChrome } from '@/components/layout/StandardChrome';
import { CommandMenuLoader } from '@/components/global/CommandMenuLoader';
import { ConsoleSignature } from '@/components/global/ConsoleSignature';
import { MotionRoot } from '@/components/global/MotionRoot';
import { LOADER_GATE_SCRIPT, PageLoader } from '@/components/global/PageLoader';
import { ScrollCompass } from '@/components/global/ScrollCompass';
import { handwriting } from '@/components/global/loader-font';
import { monaSans } from '@/app/fonts';
import { dmSerif } from '@/components/layout/footer-fonts';
import { getAllCaseStudies } from '@/lib/case-studies';
import { SITE_INDEXABLE, SITE_URL } from '@/lib/site';
import { profile } from '@/content/profile';
import '@/styles/globals.css';

/**
 * Shared defaults only. Each page sets its own title, description and
 * canonical URL — anything set here is inherited by pages that don't override
 * it, so a root canonical would mark every page as a copy of the home page.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} — Developer Portfolio | devabdullah`,
    template: '%s | devabdullah',
  },
  description: 'Developer portfolio for Abdullah Ahmad at devabdullah.com.',
  applicationName: 'devabdullah',
  authors: [{ name: profile.name, url: SITE_URL }],
  openGraph: { type: 'website', siteName: 'devabdullah', locale: 'en_GB' },
  twitter: { card: 'summary_large_image' },
  robots: SITE_INDEXABLE
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const projects = (await getAllCaseStudies()).filter(
    (project) => project.caseStudy !== false,
  );

  return (
    <html
      lang="en"
      className={`${monaSans.variable} ${GeistMono.variable} ${handwriting.variable} ${dmSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Gate the page loader before first paint (see PageLoader). */}
        <script dangerouslySetInnerHTML={{ __html: LOADER_GATE_SCRIPT }} />
        <noscript>
          <style>{'.page-loader{display:none}'}</style>
        </noscript>
      </head>
      <body>
        <StandardChrome>
          <PageLoader />
        </StandardChrome>
        <ThemeProvider>
          <SkipLink />
          <StandardChrome>
            <SiteHeader />
            <ScrollCompass />
          </StandardChrome>
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <StandardChrome>
            <SiteFooter />
          </StandardChrome>
          <CommandMenuLoader projects={projects} />
          <MotionRoot />
          <ConsoleSignature
            email={profile.contact.email}
            firstName={profile.name.split(' ')[0]}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
