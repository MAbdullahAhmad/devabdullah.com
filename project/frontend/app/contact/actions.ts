'use server';

import { z } from 'zod';
import { profile } from '@/content/profile';
import {
  CONTACT_REASONS,
  contactSchema,
  type ContactField,
  type ContactState,
} from '@/lib/contact';
import { sendOwnerEmail } from '@/lib/email';
import { guardSubmission } from '@/lib/form-guard';
import { mailtoHref } from '@/lib/mailto';

const FIELDS: ContactField[] = [
  'name',
  'email',
  'company',
  'reason',
  'message',
];

function read(formData: FormData): Partial<Record<ContactField, string>> {
  return Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? '')]),
  );
}

/**
 * Contact form handler (Blueprint Section 6.6): honeypot + minimum fill time +
 * per-IP rate limit, Zod validation, then delivery through the Resend API.
 * Spam gets a quiet success so bots learn nothing.
 */
export async function sendMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values = read(formData);

  const guard = await guardSubmission(formData, 'contact', {
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (guard.kind === 'spam') return { status: 'success' };
  if (guard.kind === 'limited') {
    return {
      status: 'error',
      message: `Too many messages from this connection. Please try again in ${guard.retryMinutes} minutes, or email ${profile.contact.email}.`,
      values,
    };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please fix the highlighted fields.',
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const { name, email, company, reason, message } = parsed.data;
  const text = [
    `From: ${name} <${email}>`,
    company ? `Company: ${company}` : null,
    `Reason: ${CONTACT_REASONS[reason]}`,
    '',
    message,
  ]
    .filter((line) => line !== null)
    .join('\n');

  const subject = `[devabdullah] ${CONTACT_REASONS[reason]} — ${name}`;
  const result = await sendOwnerEmail({ subject, text, replyTo: email });
  if (result !== 'sent') {
    return {
      status: 'error',
      message:
        result === 'not-configured'
          ? `The form can't send messages right now, so yours wasn't sent. Send it by email instead — everything is filled in for you.`
          : `Something went wrong sending your message. Please try again, or send it by email instead.`,
      mailto: mailtoHref({ to: profile.contact.email, subject, body: text }),
      values,
    };
  }

  return {
    status: 'success',
    message: `Thanks, ${name.split(' ')[0]} — your message is on its way.`,
  };
}
