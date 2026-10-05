import type { Metadata } from 'next';

import { PersonJsonLd } from '@/components/seo/PersonJsonLd';
import { Hero } from '@/components/home/Hero';
import { ProofStrip } from '@/components/home/ProofStrip';
import { ContactBlock } from '@/components/home/ContactBlock';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <div aria-hidden className="page-grid" />
      <PersonJsonLd />
      <Hero />
      <ProofStrip />
      <ContactBlock />
    </>
  );
}
