import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Work — devabdullah';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({
    eyebrow: 'Work',
    title: 'The work.',
    subtitle: 'Verified projects and case studies will be added progressively.',
  });
}
