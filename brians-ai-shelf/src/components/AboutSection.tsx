import type { SiteContent } from './StorePage';

export default function AboutSection({ content }: { content: SiteContent | null }) {
  const aboutText = content?.aboutText ||
    "I'm Brian, an AI creator and educator. I share accessible tips and practical learning resources to help people get more comfortable using AI. Start with a guide, try one idea, and make it your own.";
  const actirovaUrl = content?.actirovaUrl || 'https://actirova.com/';

  return (
    <section className="wrap" id="about">
      <div className="about">
        <div>
          <div className="kicker">A little about me</div>
          <h2>Learn AI by making it useful.</h2>
          <p>{aboutText}</p>
        </div>
        <a className="btn" href={actirovaUrl} target="_blank" rel="noopener noreferrer">
          Visit Actirova&nbsp;↗
        </a>
      </div>
    </section>
  );
}
