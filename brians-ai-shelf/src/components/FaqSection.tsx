const DEFAULT_FAQS = [
  { question: 'Are these digital products ready to download?', answer: 'After Paystack confirms a payment, private download links are sent to your email and shown on screen.' },
  { question: 'How do downloads work?', answer: 'Your files are stored securely on Cloudflare. After payment, you get a private link valid for 30 days to download directly.' },
  { question: 'How do the email tips work?', answer: 'Subscribing adds your address to the newsletter list. A welcome email is sent when email is configured.' },
];

export default function FaqSection({ faqs }: { faqs?: { question: string; answer: string }[] }) {
  const items = faqs?.length ? faqs : DEFAULT_FAQS;

  return (
    <section className="wrap faq" id="faq">
      <div className="kicker" style={{ textAlign: 'center' }}>Helpful details</div>
      <h2>Good to know.</h2>
      {items.map(({ question, answer }) => (
        <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </section>
  );
}
