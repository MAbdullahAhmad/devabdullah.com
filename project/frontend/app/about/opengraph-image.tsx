import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'About Abdullah Ahmad';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({
    eyebrow: 'About',
    title: 'Abdullah Ahmad',
    subtitle: 'Developer portfolio at devabdullah.com.',
  });
}
