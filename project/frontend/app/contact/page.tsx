import type { Metadata } from 'next';
import { ContactWithGlobe } from '@/components/ui/contact-with-globe';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Abdullah Ahmad through devabdullah.com.',
  alternates: { canonical: '/contact' },
};

/** Contact (Section 6.6, owner change OC.7): details, globe and the form. */
export default function ContactPage() {
  return <ContactWithGlobe />;
}
