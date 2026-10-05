import { Mail } from 'lucide-react';

/**
 * A form's error banner. When the form couldn't send by itself it carries a
 * `mailto` link with everything filled in, so the visitor can send the same
 * message from their own email app in one click.
 */
export function FormAlert({
  message,
  mailto,
}: {
  message: string;
  mailto?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-sm border border-danger/40 bg-danger/10 px-4 py-3 text-body-s text-text sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <p>{message}</p>
      {mailto && (
        <a
          href={mailto}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-pill bg-accent px-4 py-2 font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:self-auto"
        >
          <Mail size={16} strokeWidth={1.5} aria-hidden />
          Email it instead
        </a>
      )}
    </div>
  );
}
