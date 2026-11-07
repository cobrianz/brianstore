import { NextRequest, NextResponse } from 'next/server';
import { saveSubscriber } from '@/lib/orders';
import { getMailer, emailValid } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  if (body.website) return NextResponse.json({ ok: true, message: "Thanks — you're on the list." });

  const email = String(body.email || '').trim().toLowerCase();
  if (!emailValid(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  try {
    const result = await saveSubscriber(email);
    let welcomeSent = false;

    if (result === 'new') {
      const transport = getMailer();
      if (transport) {
        try {
          const from = process.env.SMTP_FROM || process.env.SMTP_USER;
          await transport.sendMail({
            from: `Brian's AI Study Notes <${from}>`,
            to: email,
            subject: "You're on Brian's AI tips list",
            text: "Thanks for signing up. Unsubscribe at any time by replying to this email.",
          });
          welcomeSent = true;
        } catch (e) { console.error('Welcome email failed:', e); }
      }
    }

    const message = result === 'exists'
      ? 'This address is already on the list.'
      : welcomeSent
        ? "Thanks — you're on the list. Check your inbox for a welcome note."
        : "Thanks — you're on the list.";

    return NextResponse.json({ ok: true, message });
  } catch (e) {
    console.error('Newsletter signup failed:', e);
    return NextResponse.json({ error: 'Sign-up could not be saved right now.' }, { status: 500 });
  }
}
