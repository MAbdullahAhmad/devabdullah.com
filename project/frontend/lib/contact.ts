import { z } from 'zod';

/** Reasons offered in the contact form (Blueprint Section 6.6). */
export const CONTACT_REASONS = {
  freelance: 'Project or service enquiry',
  job: 'Job opportunity',
  other: 'Other',
} as const;

export type ContactReason = keyof typeof CONTACT_REASONS;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your name (at least 2 characters).')
    .max(80, 'Please keep your name under 80 characters.'),
  email: z.email('Please enter a valid email address.').trim(),
  company: z
    .string()
    .trim()
    .max(120, 'Please keep the company name under 120 characters.')
    .optional()
    .or(z.literal('')),
  reason: z.enum(
    Object.keys(CONTACT_REASONS) as [ContactReason, ...ContactReason[]],
    {
      error: 'Please choose a reason.',
    },
  ),
  message: z
    .string()
    .trim()
    .min(20, 'Please write at least a couple of sentences (20+ characters).')
    .max(4000, 'Please keep your message under 4,000 characters.'),
});

export type ContactField = keyof z.infer<typeof contactSchema>;

export interface ContactState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: Partial<Record<ContactField, string[]>>;
  /** Submitted values, so nothing is lost when a submission fails. */
  values?: Partial<Record<ContactField, string>>;
  /** Filled-in email link when the form couldn't send by itself. */
  mailto?: string;
}

export const initialContactState: ContactState = { status: 'idle' };
