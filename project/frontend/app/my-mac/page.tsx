import type { Metadata } from 'next';
import { MyMacDesktop } from '@/components/my-mac/MyMacDesktop';
import { profile } from '@/content/profile';
import { myMacWallpaper } from '@/content/my-mac';
import { getAllCaseStudies } from '@/lib/case-studies';

export const metadata: Metadata = {
  title: 'My Mac',
  description:
    'Explore Abdullah Ahmad’s portfolio shell and public API through a personal desktop.',
  alternates: { canonical: '/my-mac' },
};

export default async function MyMacPage() {
  return (
    <MyMacDesktop
      wallpaper={myMacWallpaper}
      data={{
        name: profile.name,
        role: profile.role,
        summary: profile.summary,
        location: `${profile.location.city}, ${profile.location.country}`,
        availability: profile.availability.open
          ? profile.availability.note
          : null,
        github: profile.contact.github,
        linkedin: profile.contact.linkedin,
        instagram: profile.contact.instagram,
        experience: profile.experience,
        skills: profile.skills,
        projects: await getAllCaseStudies(),
      }}
    />
  );
}
