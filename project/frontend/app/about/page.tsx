import type { Metadata } from 'next';

import { PersonJsonLd } from '@/components/seo/PersonJsonLd';
import { profile } from '@/content/profile';
import { Container } from '@/components/layout/Container';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { BentoGrid } from '@/components/about/BentoGrid';

export const metadata: Metadata = {
  title: `About ${profile.name}`,
  description: 'About Abdullah Ahmad and the portfolio at devabdullah.com.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="pb-16 pt-32 md:pt-40">
      <Container className="flex flex-col gap-10">
        <PersonJsonLd />
        <SectionLabel title="About" />
        <BentoGrid />
      </Container>
    </div>
  );
}
