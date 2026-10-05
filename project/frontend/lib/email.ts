import 'server-only';
import nodemailer from 'nodemailer';
import { profile } from '@/content/profile';

export type SendResult = 'sent' | 'not-configured' | 'failed';

export interface EmailAttachment {
  filename: string;
  /** Plain-text content (e.g. an .ics file); base64-encoded for the API. */
  content: string;
  contentType?: string;
}

interface Message {
  to: string;
  subject: string;
  text: string;
  replyTo: string;
  attachments?: EmailAttachment[];
}

const sender = () =>
  process.env.CONTACT_FROM ?? `${profile.name} <${profile.contact.email}>`;

/** SMTP (e.g. Zoho Mail), when SMTP_HOST, SMTP_USER and SMTP_PASS are set. */
function smtpConfig() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT) || 465;
  return {
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  };
}

async function sendWithSmtp(
  config: NonNullable<ReturnType<typeof smtpConfig>>,
  message: Message,
) {
  const transport = nodemailer.createTransport(config);
  await transport.sendMail({
    // The account's own address, unless CONTACT_FROM says otherwise
    // (Zoho only sends as addresses the account owns).
    from: process.env.CONTACT_FROM ?? `${profile.name} <${config.auth.user}>`,
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    attachments: message.attachments?.map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
    })),
  });
}

async function sendWithResend(apiKey: string, message: Message) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: sender(),
      to: [message.to],
      reply_to: message.replyTo,
      subject: message.subject,
      text: message.text,
      attachments: message.attachments?.map((file) => ({
        filename: file.filename,
        content: Buffer.from(file.content, 'utf8').toString('base64'),
        content_type: file.contentType,
      })),
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Resend responded ${response.status}: ${await response.text()}`,
    );
  }
}

/**
 * Sends a plain-text email. Uses SMTP when `SMTP_HOST`, `SMTP_USER` and
 * `SMTP_PASS` are set (Zoho Mail: smtp.zoho.com or smtppro.zoho.com, port
 * 465, an app password), otherwise the Resend API when `RESEND_API_KEY` is
 * set (a domain verified in Resend). `CONTACT_FROM` overrides the sender.
 * With neither, nothing is sent and the forms offer a filled-in email link.
 */
export async function sendEmail(message: Message): Promise<SendResult> {
  const smtp = smtpConfig();
  const apiKey = process.env.RESEND_API_KEY;
  if (!smtp && !apiKey) return 'not-configured';

  try {
    if (smtp) await sendWithSmtp(smtp, message);
    else await sendWithResend(apiKey!, message);
    return 'sent';
  } catch (error) {
    console.error('Email delivery failed:', error);
    return 'failed';
  }
}

/**
 * An email to the site owner (`CONTACT_TO`, default `profile.contact.email`).
 * Replies go to the visitor.
 */
export function sendOwnerEmail(
  message: Omit<Parameters<typeof sendEmail>[0], 'to'>,
): Promise<SendResult> {
  return sendEmail({
    ...message,
    to: process.env.CONTACT_TO ?? profile.contact.email,
  });
}
