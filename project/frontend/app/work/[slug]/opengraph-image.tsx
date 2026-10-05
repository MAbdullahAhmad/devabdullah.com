import { getAllCaseStudies, getCaseStudyPageSlugs } from '@/lib/case-studies';
import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Case study — devabdullah';
export const size = OG_SIZE;
export const contentType = 'image/png';

export async function generateStaticParams() {
  const slugs = await getCaseStudyPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Metadata only — no need to load the MDX body for an image.
  const meta = (await getAllCaseStudies()).find((item) => item.slug === slug);
  return renderOg({
    eyebrow: 'Case Study',
    title: meta?.title ?? 'Case study',
    subtitle: meta?.summary,
  });
}
