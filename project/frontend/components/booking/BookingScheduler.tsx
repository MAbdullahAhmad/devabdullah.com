'use client';

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Loader2,
  Video,
} from 'lucide-react';
import { requestCall } from '@/app/book-a-call/actions';
import { booking, type CallTypeId } from '@/content/booking';
import {
  generateSlots,
  getCallType,
  initialBookingState,
  type BookingField,
} from '@/lib/booking';
import { cn } from '@/lib/cn';
import { FormAlert } from '@/components/foundation/FormAlert';

interface BookingSchedulerProps {
  name: string;
  portrait: { src: string; alt: string };
  services: { slug: string; title: string }[];
}

type Step = 'pick' | 'details';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const noop = () => () => {};
/** Captured once on the client, so every render sees the same "now". */
let nowSnapshot = 0;
const getNow = () => (nowSnapshot ||= Date.now());
const getZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

const control =
  'w-full rounded-sm border bg-surface px-3.5 py-2.5 text-body-s text-text placeholder:text-text-subtle transition-colors ease-out [transition-duration:var(--dur-fast)] hover:border-border-strong focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-invalid:border-danger';

/** `YYYY-MM-DD` for an instant in a time zone. */
function dayKey(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** A calendar day (`YYYY-MM-DD`) as a UTC-midnight Date, for display only. */
function keyToDate(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Book a call (owner change OC.4): choose a call type, a day and a time in
 * your own time zone, then add your details. The request goes to the owner by
 * email (`requestCall`), who confirms with a meeting link. Slots are computed
 * on the client after mount, because they depend on the current time.
 */
export function BookingScheduler({
  name,
  portrait,
  services,
}: BookingSchedulerProps) {
  const [state, formAction, pending] = useActionState(
    requestCall,
    initialBookingState,
  );
  const now = useSyncExternalStore(noop, getNow, () => 0);
  const zone = useSyncExternalStore(noop, getZone, () => booking.timezone);

  const restored = state.values;
  const [typeId, setTypeId] = useState<CallTypeId>(
    (restored?.callType as CallTypeId) || 'scoping',
  );
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [pickedMonth, setPickedMonth] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(restored?.slot || null);
  const [step, setStep] = useState<Step>(slot ? 'details' : 'pick');
  const [hour12, setHour12] = useState(false);

  // A server answer that rejects the time sends the visitor back to pick one.
  const [seenState, setSeenState] = useState(state);
  if (seenState !== state) {
    setSeenState(state);
    if (state.errors?.slot) {
      setSlot(null);
      setStep('pick');
    }
  }

  const form = useRef<HTMLFormElement>(null);
  const startedAt = useRef<HTMLInputElement>(null);
  const detailsHeading = useRef<HTMLHeadingElement>(null);
  const pickHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);

  const callType = getCallType(typeId);

  const byDay = useMemo(() => {
    const map = new Map<string, Date[]>();
    if (!now) return map;
    for (const date of generateSlots(callType.minutes, now)) {
      const key = dayKey(date, zone);
      map.set(key, [...(map.get(key) ?? []), date]);
    }
    return map;
  }, [now, zone, callType.minutes]);

  const days = [...byDay.keys()];
  const day = pickedDay && byDay.has(pickedDay) ? pickedDay : days[0];
  const month = pickedMonth ?? day?.slice(0, 7);
  const firstMonth = days[0]?.slice(0, 7);
  const lastMonth = days.at(-1)?.slice(0, 7);
  const daySlots = (day && byDay.get(day)) || [];
  const selected =
    slot && [...byDay.values()].flat().some((d) => d.toISOString() === slot)
      ? new Date(slot)
      : null;

  const timeFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    hour: 'numeric',
    minute: '2-digit',
    hour12,
  });
  const longDate = (date: Date) =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date);
  const ownerTime = selected
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: booking.timezone,
        hour: '2-digit',
        minute: '2-digit',
      }).format(selected)
    : null;
  const zoneLabel = zone.replace(/_/g, ' ');
  const sameZone =
    ownerTime !== null && ownerTime === timeFormat.format(selected!);

  const error = (field: BookingField) => state.errors?.[field]?.[0];
  const value = (field: BookingField) => state.values?.[field] ?? '';
  const invalid = (field: BookingField) =>
    error(field)
      ? { 'aria-invalid': true, 'aria-describedby': `${field}-error` }
      : {};

  const chooseSlot = (date: Date) => {
    setSlot(date.toISOString());
    setStep('details');
    requestAnimationFrame(() => detailsHeading.current?.focus());
  };

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-lg border border-border bg-bg-elevated px-6 py-14 text-center md:px-12"
      >
        <span className="inline-flex size-14 items-center justify-center rounded-pill bg-accent-soft text-accent-text">
          <CheckCircle2 size={28} strokeWidth={1.5} aria-hidden />
        </span>
        <h2 className="text-display-m font-semibold text-text">
          Request sent.
        </h2>
        {state.message && (
          <p className="text-body text-text">
            {
              getCallType((state.values?.callType as CallTypeId) || 'scoping')
                .title
            }{' '}
            · {state.message}
          </p>
        )}
        <p className="max-w-[44ch] text-body-s text-text-muted">
          {state.confirmationSent
            ? 'A copy of your request is on its way to your inbox. '
            : ''}
          I&apos;ll confirm by email
          {state.values?.email ? ` at ${state.values.email}` : ''} with a
          meeting link — or suggest another time if that one no longer works.
        </p>
        <Link
          href="/"
          className="text-body-s text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          Back to the home page
        </Link>
      </div>
    );
  }

  return (
    <form
      ref={form}
      action={formAction}
      className="overflow-hidden rounded-lg border border-border bg-bg-elevated shadow-[var(--shadow-floating)]"
    >
      <input type="hidden" name="slot" value={slot ?? ''} />
      <input type="hidden" name="timezone" value={zone} />
      <input ref={startedAt} type="hidden" name="startedAt" defaultValue="" />
      <div
        aria-hidden
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid lg:grid-cols-[19rem_1fr]">
        {/* Who, what and how long. */}
        <aside className="flex flex-col gap-6 border-b border-border p-6 lg:border-b-0 lg:border-r md:p-8">
          <div className="flex items-center gap-3">
            <Image
              src={portrait.src}
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-pill object-cover object-top"
            />
            <div className="flex flex-col">
              <span className="text-body-s font-medium text-text">{name}</span>
              <span className="font-mono text-label text-text-subtle">
                Book a call
              </span>
            </div>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-mono text-label text-text-subtle">
              Type of call
            </legend>
            {booking.callTypes.map((type) => (
              <label
                key={type.id}
                className={cn(
                  'group relative flex cursor-pointer flex-col gap-1 rounded-md border p-3.5 transition-colors ease-out [transition-duration:var(--dur-fast)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
                  typeId === type.id
                    ? 'border-accent bg-accent-soft'
                    : 'border-border hover:border-border-strong',
                )}
              >
                <input
                  type="radio"
                  name="callType"
                  value={type.id}
                  checked={typeId === type.id}
                  onChange={() => setTypeId(type.id)}
                  className="sr-only"
                />
                <span className="flex items-center justify-between gap-3">
                  <span className="text-body-s font-medium text-text">
                    {type.title}
                  </span>
                  <span className="shrink-0 whitespace-nowrap font-mono text-label text-text-muted">
                    {type.minutes} min
                  </span>
                </span>
                <span className="text-body-s text-text-muted">
                  {type.description}
                </span>
              </label>
            ))}
          </fieldset>

          <ul className="flex flex-col gap-2.5 text-body-s text-text-muted">
            <li className="flex items-center gap-2.5">
              <Clock size={16} strokeWidth={1.5} aria-hidden />
              {callType.minutes} minutes
            </li>
            <li className="flex items-center gap-2.5">
              <Video size={16} strokeWidth={1.5} aria-hidden />
              Video call — link sent when confirmed
            </li>
            <li className="flex items-center gap-2.5">
              <Globe size={16} strokeWidth={1.5} aria-hidden />
              <span>
                Times in <span className="text-text">{zoneLabel}</span>
              </span>
            </li>
            {selected && (
              <li className="flex items-start gap-2.5 text-text">
                <CalendarDays
                  size={16}
                  strokeWidth={1.5}
                  aria-hidden
                  className="mt-0.5 shrink-0"
                />
                <span>
                  {longDate(keyToDate(dayKey(selected, zone)))},{' '}
                  {timeFormat.format(selected)}
                  {!sameZone && (
                    <span className="block text-text-subtle">
                      {ownerTime} in {booking.cityLabel}
                    </span>
                  )}
                </span>
              </li>
            )}
          </ul>
        </aside>

        {step === 'pick' ? (
          <div className="grid gap-8 p-6 md:grid-cols-[1fr_13rem] md:p-8">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <h2
                  ref={pickHeading}
                  tabIndex={-1}
                  className="text-h4 text-text outline-none"
                >
                  Choose a date
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous month"
                    disabled={!month || !firstMonth || month <= firstMonth}
                    onClick={() =>
                      month && setPickedMonth(shiftMonth(month, -1))
                    }
                    className="inline-flex size-8 items-center justify-center rounded-pill text-text-muted transition-colors hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronLeft size={16} strokeWidth={1.5} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Next month"
                    disabled={!month || !lastMonth || month >= lastMonth}
                    onClick={() =>
                      month && setPickedMonth(shiftMonth(month, 1))
                    }
                    className="inline-flex size-8 items-center justify-center rounded-pill text-text-muted transition-colors hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronRight size={16} strokeWidth={1.5} aria-hidden />
                  </button>
                </div>
              </div>

              {month ? (
                <Calendar
                  month={month}
                  available={byDay}
                  selected={day}
                  today={dayKey(new Date(now), zone)}
                  onSelect={(key) => {
                    setPickedDay(key);
                    setPickedMonth(key.slice(0, 7));
                  }}
                />
              ) : (
                <CalendarSkeleton />
              )}

              {error('slot') && (
                <p
                  id="slot-error"
                  role="alert"
                  className="text-body-s text-danger"
                >
                  {state.message ?? error('slot')}
                </p>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-body-s font-medium text-text">
                  {day ? (
                    new Intl.DateTimeFormat('en-GB', {
                      timeZone: 'UTC',
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    }).format(keyToDate(day))
                  ) : (
                    <span className="text-text-subtle">Loading…</span>
                  )}
                </h3>
                <div
                  role="group"
                  aria-label="Time format"
                  className="flex rounded-pill border border-border p-0.5 font-mono text-[0.6875rem]"
                >
                  {[
                    { label: '24h', value: false },
                    { label: '12h', value: true },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      aria-pressed={hour12 === option.value}
                      onClick={() => setHour12(option.value)}
                      className={cn(
                        'rounded-pill px-2 py-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-accent',
                        hour12 === option.value
                          ? 'bg-surface text-text'
                          : 'text-text-subtle hover:text-text-muted',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <ul
                aria-label="Available times"
                className="flex max-h-[23rem] flex-col gap-2 overflow-y-auto pr-1 [scrollbar-width:thin]"
              >
                {daySlots.map((date) => {
                  const iso = date.toISOString();
                  const active = slot === iso;
                  return (
                    <li key={iso}>
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => chooseSlot(date)}
                        className={cn(
                          'w-full rounded-md border py-2.5 text-center font-mono text-body-s transition-colors ease-out [transition-duration:var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                          active
                            ? 'border-accent bg-accent text-white'
                            : 'border-border text-text hover:border-accent hover:text-accent-text',
                        )}
                      >
                        {timeFormat.format(date)}
                      </button>
                    </li>
                  );
                })}
                {now > 0 && daySlots.length === 0 && (
                  <li className="text-body-s text-text-muted">
                    No times left this week — try another day.
                  </li>
                )}
                {now === 0 &&
                  Array.from({ length: 6 }, (_, index) => (
                    <li
                      key={index}
                      className="h-11 animate-pulse rounded-md bg-surface"
                    />
                  ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2
                ref={detailsHeading}
                tabIndex={-1}
                className="text-h4 text-text outline-none"
              >
                Your details
              </h2>
              <button
                type="button"
                onClick={() => {
                  setStep('pick');
                  requestAnimationFrame(() => pickHeading.current?.focus());
                }}
                className="inline-flex items-center gap-1.5 rounded-sm text-body-s text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
                Change time
              </button>
            </div>

            {state.status === 'error' && state.message && !error('slot') && (
              <FormAlert message={state.message} mailto={state.mailto} />
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="name" label="Name" error={error('name')}>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                  defaultValue={value('name')}
                  className={cn(
                    control,
                    error('name') ? 'border-danger' : 'border-border',
                  )}
                  {...invalid('name')}
                />
              </Field>
              <Field id="email" label="Email" error={error('email')}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue={value('email')}
                  className={cn(
                    control,
                    error('email') ? 'border-danger' : 'border-border',
                  )}
                  {...invalid('email')}
                />
              </Field>
              <Field
                id="company"
                label="Company"
                optional
                error={error('company')}
              >
                <input
                  id="company"
                  name="company"
                  autoComplete="organization"
                  maxLength={120}
                  defaultValue={value('company')}
                  className={cn(
                    control,
                    error('company') ? 'border-danger' : 'border-border',
                  )}
                  {...invalid('company')}
                />
              </Field>
              <Field id="service" label="Topic" error={error('service')}>
                <div className="relative">
                  <select
                    key={value('service') || 'none'}
                    id="service"
                    name="service"
                    required
                    defaultValue={value('service')}
                    className={cn(
                      control,
                      'appearance-none pr-9',
                      error('service') ? 'border-danger' : 'border-border',
                    )}
                    {...invalid('service')}
                  >
                    <option value="" disabled>
                      Choose a topic
                    </option>
                    {services.map((service) => (
                      <option key={service.slug} value={service.slug}>
                        {service.title}
                      </option>
                    ))}
                    <option value="other">Something else</option>
                  </select>
                  <ChevronDown
                    size={16}
                    strokeWidth={1.5}
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle"
                  />
                </div>
              </Field>
            </div>

            <Field
              id="notes"
              label="What would you like to discuss?"
              error={error('notes')}
            >
              <textarea
                id="notes"
                name="notes"
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                defaultValue={value('notes')}
                placeholder="A few lines about the system, the problem or the question."
                className={cn(
                  control,
                  'resize-y',
                  error('notes') ? 'border-danger' : 'border-border',
                )}
                {...invalid('notes')}
              />
            </Field>

            <div className="flex flex-col-reverse items-start gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-[40ch] text-body-s text-text-subtle">
                This sends a request — I&apos;ll confirm by email with a meeting
                link.
              </p>
              <button
                type="submit"
                disabled={pending || !selected}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-accent px-6 text-body-s font-medium text-white transition-colors ease-out [transition-duration:var(--dur-base)] hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-60"
              >
                {pending && (
                  <Loader2
                    size={16}
                    strokeWidth={1.5}
                    className="animate-spin"
                    aria-hidden
                  />
                )}
                {pending ? 'Sending…' : 'Request call'}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: BookingField;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="flex items-baseline justify-between text-body-s text-text"
      >
        {label}
        {optional && (
          <span className="font-mono text-label text-text-subtle">
            optional
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-body-s text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** A month grid (Monday first). Only days with open times are selectable. */
function Calendar({
  month,
  available,
  selected,
  today,
  onSelect,
}: {
  month: string;
  available: Map<string, Date[]>;
  selected?: string;
  today: string;
  onSelect: (key: string) => void;
}) {
  const [year, monthIndex] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const leading = (first.getUTCDay() + 6) % 7;
  const length = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const cells = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length }, (_, index) => index + 1),
  ];
  const monthLabel = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(first);

  return (
    <div className="flex flex-col gap-3">
      <p aria-live="polite" className="text-body-s font-medium text-text-muted">
        {monthLabel}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((weekday) => (
          <span
            key={weekday}
            aria-hidden
            className="pb-2 font-mono text-[0.6875rem] uppercase text-text-subtle"
          >
            {weekday}
          </span>
        ))}
        {cells.map((date, index) => {
          if (date === null) return <span key={`blank-${index}`} />;
          const key = `${month}-${String(date).padStart(2, '0')}`;
          const count = available.get(key)?.length ?? 0;
          const isSelected = key === selected;
          const label = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'UTC',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(keyToDate(key));
          return (
            <button
              key={key}
              type="button"
              disabled={count === 0}
              aria-pressed={isSelected}
              aria-label={
                count > 0
                  ? `${label}, ${count} time${count === 1 ? '' : 's'} available`
                  : `${label}, unavailable`
              }
              onClick={() => onSelect(key)}
              className={cn(
                'relative mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-md text-body-s transition-colors ease-out [transition-duration:var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                isSelected
                  ? 'bg-accent font-semibold text-white'
                  : count > 0
                    ? 'bg-surface font-medium text-text hover:bg-accent-soft hover:text-accent-text'
                    : 'text-text-subtle/50',
                key === today &&
                  !isSelected &&
                  'ring-1 ring-inset ring-border-strong',
              )}
            >
              {date}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-1" aria-hidden>
      {Array.from({ length: 35 }, (_, index) => (
        <span
          key={index}
          className="mx-auto aspect-square w-full max-w-11 animate-pulse rounded-md bg-surface"
        />
      ))}
    </div>
  );
}
