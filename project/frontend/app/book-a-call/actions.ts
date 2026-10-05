'use server';

import { z } from 'zod';
import { profile } from '@/content/profile';
import { booking } from '@/content/booking';
import { services } from '@/content/services';
import {
  bookingSchema,
  formatSlot,
  getCallType,
  isBookableSlot,
  type BookingField,
  type BookingState,
} from '@/lib/booking';
import { sendEmail, sendOwnerEmail } from '@/lib/email';
import { buildIcs } from '@/lib/ics';
import { mailtoHref } from '@/lib/mailto';
import { guardSubmission } from '@/lib/form-guard';

const FIELDS: BookingField[] = [
  'callType',
  'slot',
  'timezone',
  'name',
  'email',
  'company',
  'service',
  'notes',
];

/**
 * Book-a-call handler (owner change OC.4). Same protection as the contact
 * form, then Zod validation, a server-side check that the slot is still
 * bookable, and an email to the owner (with a tentative calendar invite
 * attached), who confirms with a meeting link. The visitor then gets a copy
 * of their request; that one is best effort and never fails the booking.
 */
export async function requestCall(
  _previous: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? '')]),
  ) as Partial<Record<BookingField, string>>;

  const guard = await guardSubmission(formData, 'booking', {
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (guard.kind === 'spam') return { status: 'success' };
  if (guard.kind === 'limited') {
    return {
      status: 'error',
      message: `Too many requests from this connection. Please try again in ${guard.retryMinutes} minutes, or email ${profile.contact.email}.`,
      values,
    };
  }

  const parsed = bookingSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please fix the highlighted fields.',
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const data = parsed.data;
  const callType = getCallType(data.callType);
  if (!isBookableSlot(data.slot, callType.minutes, Date.now())) {
    return {
      status: 'error',
      message: 'That time is no longer available. Please choose another.',
      errors: { slot: ['Please choose another time.'] },
      values: { ...values, slot: '' },
    };
  }

  const start = new Date(data.slot);
  const ownerTime = formatSlot(start, booking.timezone);
  const visitorZone = data.timezone || booking.timezone;
  let visitorTime = ownerTime;
  try {
    visitorTime = formatSlot(start, visitorZone);
  } catch {
    // An unknown time zone name: fall back to the configured owner time zone.
  }
  const topic =
    services.find((service) => service.slug === data.service)?.title ??
    'Something else';

  const text = [
    `Call request: ${callType.title} (${callType.minutes} min)`,
    `When: ${ownerTime} (${booking.cityLabel})`,
    visitorZone !== booking.timezone
      ? `Their time: ${visitorTime} (${visitorZone})`
      : null,
    '',
    `From: ${data.name} <${data.email}>`,
    data.company ? `Company: ${data.company}` : null,
    `Topic: ${topic}`,
    '',
    data.notes,
    '',
    'Reply to this email to confirm and send a meeting link, or suggest another time.',
  ]
    .filter((line) => line !== null)
    .join('\n');

  const invite = buildIcs({
    uid: `${start.getTime()}-${crypto.randomUUID()}@devabdullah.com`,
    start,
    minutes: callType.minutes,
    summary: `${callType.title} with ${data.name}${data.company ? ` (${data.company})` : ''}`,
    description: `Topic: ${topic}\n\n${data.notes}\n\nRequested through devabdullah.com/book-a-call. Not confirmed yet.`,
    organizer: { name: profile.name, email: profile.contact.email },
    attendee: { name: data.name, email: data.email },
  });

  const subject = `[devabdullah] Call request — ${callType.title}, ${ownerTime} — ${data.name}`;
  const result = await sendOwnerEmail({
    subject,
    text,
    replyTo: data.email,
    attachments: [
      {
        filename: 'call-request.ics',
        content: invite,
        contentType: 'text/calendar; charset=utf-8',
      },
    ],
  });
  if (result !== 'sent') {
    return {
      status: 'error',
      message:
        result === 'not-configured'
          ? `Online booking can't send requests right now, so yours wasn't sent. Send it by email instead — everything is filled in for you.`
          : `Something went wrong sending your request. Please try again, or send it by email instead.`,
      mailto: mailtoHref({
        to: profile.contact.email,
        subject,
        // The owner-facing text minus its last line (addressed to the owner).
        body: text.replace(/\n\nReply to this email[^\n]*$/, ''),
      }),
      values,
    };
  }

  const visitorWhen = `${visitorTime} (${visitorZone !== booking.timezone ? visitorZone : booking.cityLabel})`;
  const confirmation = await sendEmail({
    to: data.email,
    replyTo: profile.contact.email,
    subject: `Your call request — ${callType.title}, ${visitorWhen}`,
    text: [
      `Hi ${data.name},`,
      '',
      `Thanks for booking a call. Your request is in:`,
      '',
      `${callType.title} (${callType.minutes} min)`,
      `${visitorWhen}`,
      `Topic: ${topic}`,
      '',
      `I'll reply to confirm the time and send a meeting link, or suggest another time if that one no longer works. If anything changes, just reply to this email.`,
      '',
      profile.name,
      'devabdullah · devabdullah.com',
    ].join('\n'),
  });

  return {
    status: 'success',
    confirmationSent: confirmation === 'sent',
    message: `${visitorTime}${visitorZone !== booking.timezone ? ` (${visitorZone})` : ` (${booking.cityLabel})`}`,
    values: { name: data.name, email: data.email, callType: data.callType },
  };
}
