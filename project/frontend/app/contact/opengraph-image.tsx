import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Contact Abdullah Ahmad';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({
    eyebrow: 'Contact',
    title: 'Let’s build something solid.',
    subtitle: 'Hiring for a full-stack role, or need a system built?',
  });
}
