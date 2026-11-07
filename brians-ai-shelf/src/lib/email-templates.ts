interface EmailItem {
  name: string;
  url: string;
}

interface ReceiptEmailInput {
  items: EmailItem[];
  reference: string;
  amount: number;
  currency: string;
  expiresAt: Date;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!);
}

function emailLayout(content: string, preheader: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Brian's AI Downloads</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f5ef;color:#202720;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f5ef;">
      <tr>
        <td align="center" style="padding:36px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e4e9e1;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:25px 32px;background:#1f4d38;color:#ffffff;">
                <p style="margin:0;font-size:12px;line-height:18px;font-weight:bold;letter-spacing:1.6px;text-transform:uppercase;">Brian's AI Downloads</p>
                <p style="margin:5px 0 0;color:#d8e8dc;font-size:13px;line-height:19px;">Practical tools for learning and creating</p>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 32px 30px;">${content}</td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #e8ece6;color:#68736b;font-size:12px;line-height:19px;">
                <p style="margin:0;">Sent by Brian's AI Downloads.</p>
                <p style="margin:5px 0 0;">If you need help, reply to this email.</p>
              </td>
            </tr>
          </table>
          <p style="max-width:560px;margin:16px 0 0;color:#778078;font-size:11px;line-height:17px;">You're receiving this message because you signed up or completed a purchase on our store.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(label: string, url: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
    <tr>
      <td bgcolor="#2d6a4f" style="border-radius:7px;">
        <a href="${escapeHtml(url)}" style="display:inline-block;padding:13px 20px;color:#ffffff;font-size:14px;line-height:20px;font-weight:bold;text-decoration:none;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

export function welcomeEmail(storeUrl: string) {
  const safeStoreUrl = escapeHtml(storeUrl);
  const content = `<p style="margin:0 0 8px;color:#2d6a4f;font-size:12px;line-height:18px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Welcome</p>
    <h1 style="margin:0 0 16px;color:#202720;font-size:27px;line-height:34px;">You're on the list.</h1>
    <p style="margin:0 0 14px;color:#4f5b52;font-size:15px;line-height:24px;">Thanks for signing up for Brian's AI Study Notes. You'll receive practical ideas and useful resources for learning and creating with AI.</p>
    <p style="margin:0;color:#4f5b52;font-size:15px;line-height:24px;">In the meantime, explore the free guides and find a resource to try at your own pace.</p>
    ${button('Explore free guides', `${safeStoreUrl}/#resources`)}
    <p style="margin:0;color:#68736b;font-size:13px;line-height:21px;">No longer want these updates? Reply to this email and ask to unsubscribe.</p>`;

  return {
    subject: "Welcome to Brian's AI Study Notes",
    text: `Welcome!\n\nThanks for signing up for Brian's AI Study Notes. You'll receive practical ideas and useful resources for learning and creating with AI.\n\nExplore the free guides: ${storeUrl}/#resources\n\nNo longer want these updates? Reply to this email and ask to unsubscribe.`,
    html: emailLayout(content, 'Thanks for signing up. Your practical AI study notes are on the way.'),
  };
}

export function receiptEmail({ items, reference, amount, currency, expiresAt }: ReceiptEmailInput) {
  const safeItems = items.map(item => ({
    name: escapeHtml(item.name),
    url: escapeHtml(item.url),
  }));
  const safeReference = escapeHtml(reference);
  const safeCurrency = currency.toUpperCase();
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: safeCurrency,
  }).format(amount / 100);
  const formattedExpiry = expiresAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const downloadList = safeItems.map(item => `${item.name}\n${item.url}`).join('\n\n');
  const itemRows = safeItems.map(item => `<tr>
    <td style="padding:16px 0;border-bottom:1px solid #e8ece6;">
      <p style="margin:0 0 12px;color:#202720;font-size:15px;line-height:22px;font-weight:bold;">${item.name}</p>
      ${button('Download resource', item.url)}
      <p style="margin:0;color:#7a847c;font-size:11px;line-height:17px;word-break:break-all;">Button not working? Copy this link:<br><a href="${item.url}" style="color:#2d6a4f;">${item.url}</a></p>
    </td>
  </tr>`).join('');
  const content = `<p style="margin:0 0 8px;color:#2d6a4f;font-size:12px;line-height:18px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Payment confirmed</p>
    <h1 style="margin:0 0 12px;color:#202720;font-size:27px;line-height:34px;">Thank you for your order.</h1>
    <p style="margin:0 0 22px;color:#4f5b52;font-size:15px;line-height:24px;">Your payment is confirmed. Your resources are ready to download below.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;background:#f6f8f4;border-radius:8px;">
      <tr><td style="padding:14px 16px;color:#68736b;font-size:12px;line-height:18px;">Order reference</td><td align="right" style="padding:14px 16px;color:#202720;font-size:12px;line-height:18px;font-weight:bold;">${safeReference}</td></tr>
      <tr><td style="padding:0 16px 14px;color:#68736b;font-size:12px;line-height:18px;">Total paid</td><td align="right" style="padding:0 16px 14px;color:#202720;font-size:14px;line-height:20px;font-weight:bold;">${escapeHtml(formattedAmount)}</td></tr>
    </table>
    <h2 style="margin:0;color:#202720;font-size:17px;line-height:24px;">Your downloads</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${itemRows}</table>
    <p style="margin:20px 0 0;color:#68736b;font-size:13px;line-height:21px;">Your private download links are available until <strong style="color:#354139;">${escapeHtml(formattedExpiry)}</strong>. Save your files somewhere safe after downloading.</p>
    <p style="margin:14px 0 0;color:#68736b;font-size:13px;line-height:21px;">If you have trouble with your order, reply to this email and include your order reference.</p>`;

  return {
    subject: 'Your order is confirmed — Brian’s AI Downloads',
    text: `PAYMENT CONFIRMED\n\nThank you for your order. Your payment is confirmed.\n\nOrder reference: ${reference}\nTotal paid: ${formattedAmount}\n\nYOUR DOWNLOADS\n${downloadList}\n\nYour private download links are available until ${formattedExpiry}. Save your files somewhere safe after downloading.\n\nIf you have trouble with your order, reply to this email and include your order reference.`,
    html: emailLayout(content, `Your payment is confirmed. Download your resources by ${formattedExpiry}.`),
  };
}
