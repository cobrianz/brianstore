'use client';

import { useState } from 'react';
import type { SiteContent } from './StorePage';

export default function Hero({ content }: { content: SiteContent | null }) {
  const [note, setNote] = useState('Free email updates. Unsubscribe by replying to a welcome email.');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('button') as HTMLButtonElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    btn.disabled = true;
    btn.textContent = 'Please wait…';
    setNote('');
    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Could not sign you up just now.');
      setNote(data.message || "Thanks — you're on the list.");
      form.reset();
    } catch (err: any) {
      setNote(err.message.includes('Failed to fetch') ? 'Newsletter sign-up is unavailable right now.' : err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Get free AI tips';
    }
  }

  const subtitle = content?.heroSubtitle || 'I make AI study simple.';
  const newsletterText = content?.newsletterText || 'Get useful AI tips, tools, and guides in your inbox.';

  return (
    <section className="wrap hero">
      <div className="hero-copy">
        <div className="kicker">AI creator &amp; educator</div>
        <h1><span className="hero-im">Hey, I&apos;m</span><br /><span className="hero-brian">Brian.</span></h1>
        <p className="lead">{subtitle}</p>
        <p className="sublead">{newsletterText} Clear explanations and practical ideas to help you learn and create with AI.</p>
        <form className="signup" id="newsletter" onSubmit={handleSubmit}>
          <label htmlFor="email" style={{ position: 'absolute', left: '-9999px' }}>Your email address</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" required autoComplete="email" />
          <button type="submit">Get free AI tips</button>
        </form>
        <p className="formnote">{note}</p>
        <div className="hero-links">
          <a className="outline" href="#resources">Browse free guides&nbsp;→</a>
          <a className="tiny-link" href="#resources">Already subscribed? Explore resources →</a>
        </div>
      </div>

      <div className="portrait-wrap">
        <span className="scribble one">A little learning goes a long way</span>
        <span className="scribble three">AI, made approachable</span>
        <div className="portrait-frame">
          <img src="/assets/brian-profile.jpg" alt="Brian Cheruiyot" />
        </div>
        <span className="scribble two">Your AI study companion</span>
        <div className="hero-caption">BRIAN CHERUIYOT · AI CREATOR &amp; EDUCATOR</div>
        <div className="profile-links" aria-label="Brian's portfolio and social links">
          {content?.socialLinks?.length ? content.socialLinks.map(s => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
               className={s.label === 'Portfolio' ? 'featured-link' : ''}>
              {s.label} ↗
            </a>
          )) : (
            <>
              <a className="featured-link" href="https://briankcheruiyot.netlify.app/" target="_blank" rel="noopener noreferrer">Portfolio ↗</a>
              <a href="https://actirova.com/" target="_blank" rel="noopener noreferrer">Actirova · AI learning ↗</a>
              <a href="https://x.com/actirova">X · @actirova ↗</a>
              <a href="https://www.linkedin.com/in/cheruiyotbrian/">LinkedIn ↗</a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
