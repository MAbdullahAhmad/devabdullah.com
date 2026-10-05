'use client';

import { useActionState, useEffect, useRef } from 'react';
import { CheckCircle2, ChevronDown, Loader2, Send } from 'lucide-react';
import { sendMessage } from '@/app/contact/actions';
import {
  CONTACT_REASONS,
  initialContactState,
  type ContactField,
} from '@/lib/contact';
import { cn } from '@/lib/cn';
import { FormAlert } from '@/components/foundation/FormAlert';

const control =
  'w-full rounded-sm border bg-surface px-3.5 py-2.5 text-body-s text-text placeholder:text-text-subtle transition-colors ease-out [transition-duration:var(--dur-fast)] hover:border-border-strong focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-invalid:border-danger';

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: ContactField;
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

/**
 * Contact form (Blueprint Section 6.6). A Server Action via `useActionState`,
 * so it works without JavaScript too; HTML attributes give instant hints and
 * Zod validates on the server. Honeypot + fill-time fields for spam.
 */
export function ContactForm({
  bare = false,
}: {
  /** Drop the card chrome when the form sits inside another card. */
  bare?: boolean;
}) {
  const card = bare
    ? ''
    : 'rounded-lg border border-border bg-bg-elevated p-6 md:p-8';
  const [state, formAction, pending] = useActionState(
    sendMessage,
    initialContactState,
  );
  const form = useRef<HTMLFormElement>(null);
  const startedAt = useRef<HTMLInputElement>(null);

  // Stamp when the form became interactive (read by the fill-time check).
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);

  // After a failed submit, move focus to the first invalid field.
  useEffect(() => {
    if (state.status !== 'error' || !state.errors) return;
    const first = Object.keys(state.errors)[0];
    if (first)
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [state]);

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className={cn('flex flex-col items-start gap-4', card)}
      >
        <CheckCircle2
          size={28}
          strokeWidth={1.5}
          className="text-success"
          aria-hidden
        />
        <p className="text-h3 text-text">Message sent.</p>
        <p className="text-body-s text-text-muted">
          {state.message ?? 'Thanks — your message is on its way.'}
        </p>
      </div>
    );
  }

  const error = (field: ContactField) => state.errors?.[field]?.[0];
  const value = (field: ContactField) => state.values?.[field] ?? '';
  const invalid = (field: ContactField) =>
    error(field)
      ? { 'aria-invalid': true, 'aria-describedby': `${field}-error` }
      : {};

  return (
    <form
      ref={form}
      action={formAction}
      className={cn('flex flex-col gap-6', card)}
    >
      {state.status === 'error' && state.message && (
        <FormAlert message={state.message} mailto={state.mailto} />
      )}

      <div className="grid gap-6 sm:grid-cols-2">
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
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="company" label="Company" optional error={error('company')}>
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
        <Field id="reason" label="Reason" error={error('reason')}>
          <div className="relative">
            <select
              // Remount with the submitted value: React's post-action form reset
              // would otherwise restore the originally selected option.
              key={value('reason') || 'freelance'}
              id="reason"
              name="reason"
              required
              defaultValue={value('reason') || 'freelance'}
              className={cn(
                control,
                'appearance-none pr-9',
                error('reason') ? 'border-danger' : 'border-border',
              )}
              {...invalid('reason')}
            >
              {Object.entries(CONTACT_REASONS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
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

      <Field id="message" label="Message" error={error('message')}>
        <textarea
          id="message"
          name="message"
          required
          minLength={20}
          maxLength={4000}
          rows={6}
          defaultValue={value('message')}
          className={cn(
            control,
            'resize-y',
            error('message') ? 'border-danger' : 'border-border',
          )}
          {...invalid('message')}
        />
      </Field>

      {/* Spam traps: invisible to people, tempting to bots. */}
      <div
        aria-hidden
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedAt} type="hidden" name="startedAt" defaultValue="" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-body-s text-text-subtle">
          All fields except company are required.
        </p>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
          className="inline-flex h-12 items-center gap-2 rounded-pill bg-accent px-6 text-body font-medium text-white transition-colors ease-out [transition-duration:var(--dur-base)] hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
        >
          {pending ? (
            <Loader2
              size={18}
              strokeWidth={1.5}
              className="animate-spin motion-reduce:hidden"
              aria-hidden
            />
          ) : (
            <Send size={18} strokeWidth={1.5} aria-hidden />
          )}
          {pending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
