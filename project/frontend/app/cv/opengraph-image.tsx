import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'CV — Abdullah Ahmad';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({
    eyebrow: 'CV',
    title: 'Abdullah Ahmad',
    subtitle:
      'Full-Stack Software Engineer · Laravel, React & Vue · SaaS, CMS and ERP Systems',
  });
}
