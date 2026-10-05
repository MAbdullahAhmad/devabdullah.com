import { z } from 'zod';
import { booking, type CallTypeId } from '@/content/booking';
import { services } from '@/content/services';

const HOUR = 3_600_000;
const MINUTE = 60_000;

export function getCallType(id: CallTypeId) {
  return booking.callTypes.find((type) => type.id === id)!;
}

/**
 * Every bookable start time for a call of `minutes`, as UTC instants: the
 * configured weekdays and hours in the owner time zone, from `now + minNoticeHours`
 * until `daysAhead` days out. Used by the picker and re-checked on the server.
 */
export function generateSlots(minutes: number, now: number): Date[] {
  const offset = booking.utcOffsetMinutes * MINUTE;
  const local = new Date(now + offset);
  const earliest = now + booking.minNoticeHours * HOUR;
  const slots: Date[] = [];

  for (let day = 0; day <= booking.daysAhead; day += 1) {
    const midnight = Date.UTC(
      local.getUTCFullYear(),
      local.getUTCMonth(),
      local.getUTCDate() + day,
    );
    if (!booking.weekdays.includes(new Date(midnight).getUTCDay())) continue;

    for (
      let start = booking.startHour * 60;
      start + minutes <= booking.endHour * 60;
      start += booking.stepMinutes
    ) {
      const instant = midnight + start * MINUTE - offset;
      if (instant >= earliest) slots.push(new Date(instant));
    }
  }
  return slots;
}

export function isBookableSlot(
  iso: string,
  minutes: number,
  now: number,
): boolean {
  const time = Date.parse(iso);
  return generateSlots(minutes, now).some((slot) => slot.getTime() === time);
}

/** "Tuesday 30 September, 14:00" in the given time zone. */
export function formatSlot(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const SERVICE_IDS: [string, ...string[]] = [
  'other',
  ...services.map((service) => service.slug),
];
const CALL_TYPE_IDS = booking.callTypes.map((type) => type.id) as [
  CallTypeId,
  ...CallTypeId[],
];

export const bookingSchema = z.object({
  callType: z.enum(CALL_TYPE_IDS, { error: 'Please choose a type of call.' }),
  slot: z.iso.datetime({ error: 'Please choose a date and time.' }),
  timezone: z.string().trim().max(64).optional().or(z.literal('')),
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
  service: z.enum(SERVICE_IDS, { error: 'Please choose a topic.' }),
  notes: z
    .string()
    .trim()
    .min(10, 'Please add a line about what you’d like to discuss.')
    .max(2000, 'Please keep this under 2,000 characters.'),
});

export type BookingField = keyof z.infer<typeof bookingSchema>;

export interface BookingState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: Partial<Record<BookingField, string[]>>;
  values?: Partial<Record<BookingField, string>>;
  /** Filled-in email link when the request couldn't be sent by itself. */
  mailto?: string;
  /** Whether the visitor's confirmation email went out. */
  confirmationSent?: boolean;
}

export const initialBookingState: BookingState = { status: 'idle' };
