import type { Testimonial } from '@/content/profile';

/**
 * Seed quotes for the "In their words" section — **fictional**, for layout
 * only. The people are made up and the companies are the well-known fictional
 * sample companies (Contoso, Fabrikam, Northwind…), so nothing here is, or
 * could be read as, a real endorsement.
 *
 * Shown only while the site is not public (`SITE_INDEXABLE` off) and there are
 * no real quotes in `profile.testimonials`; they disappear on their own at
 * launch. TODO(owner): replace with real quotes, used with permission.
 */
export const seedTestimonials: Testimonial[] = [
  {
    quote:
      'He rebuilt our order API in weeks. Checkout errors dropped away and the team finally trusts the numbers.',
    name: 'Sara Whitfield',
    title: 'Head of Product',
    company: 'Contoso Retail',
  },
  {
    quote:
      'The schema he designed made every report we asked for afterwards straightforward. Clear thinking, clearly documented.',
    name: 'Daniel Okafor',
    title: 'Operations Director',
    company: 'Fabrikam Logistics',
  },
  {
    quote:
      'Our POS used to live in spreadsheets. Now orders, invoices and daily reports all come from one system.',
    name: 'Layla Haddad',
    title: 'Owner',
    company: 'Northwind Laundry',
  },
  {
    quote:
      'Calm, organised and quick to spot the real problem. Every update came before we had to ask.',
    name: 'Marcus Lindqvist',
    title: 'Project Manager',
    company: 'Tailspin Studios',
  },
  {
    quote:
      'He connected our CRM, payments and email into one flow and took hours of manual work off the team every week.',
    name: 'Priya Raman',
    title: 'COO',
    company: 'Wide World Importers',
  },
  {
    quote:
      'Slow queries were costing us customers. After his tuning, the dashboard loads before you notice it loading.',
    name: 'Tom Becker',
    title: 'CTO',
    company: 'Adventure Works',
  },
  {
    quote:
      'He took over a legacy Laravel app nobody wanted to touch, fixed it and left documentation we actually use.',
    name: 'Nadia Farouk',
    title: 'Engineering Lead',
    company: 'Litware Systems',
  },
  {
    quote:
      'Great at turning vague requirements into a plan developers can build from. It saved us weeks of back and forth.',
    name: 'James Holloway',
    title: 'Founder',
    company: 'Proseware',
  },
  {
    quote:
      'Reliable from the first call to launch. The API was documented, tested and handed over properly.',
    name: 'Aisha Kareem',
    title: 'Product Owner',
    company: 'Woodgrove Digital',
  },
];
