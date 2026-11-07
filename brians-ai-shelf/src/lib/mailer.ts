import nodemailer from 'nodemailer';

export function getMailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (
    !SMTP_HOST || !SMTP_USER || !SMTP_PASS ||
    /^(your-|replace-|your_email)/i.test(SMTP_USER) ||
    /^(replace-|your-)/i.test(SMTP_PASS)
  ) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT || 587) === 465,
    requireTLS: Number(SMTP_PORT || 587) === 587,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export function emailValid(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function publicBaseUrl() {
  const raw = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('PUBLIC_BASE_URL must be http or https.');
  return url.origin;
}
