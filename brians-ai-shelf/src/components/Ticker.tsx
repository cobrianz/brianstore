export default function Ticker({ tickerText }: { tickerText?: string }) {
  const raw = tickerText || 'MAKE A THING ✳ LEARN A LITTLE ✳ GET UNSTUCK ✳';
  // Split on ✳ and rebuild
  const parts = raw.split('✳').map(s => s.trim()).filter(Boolean);
  const items = parts.length ? [...parts, ...parts] : ['MAKE A THING', 'LEARN A LITTLE', 'GET UNSTUCK', 'MAKE A THING', 'LEARN A LITTLE', 'GET UNSTUCK'];

  return (
    <div className="ticker" aria-label={raw}>
      {items.map((text, i) => (
        <span key={i}>{text} <i>✳</i></span>
      ))}
    </div>
  );
}
