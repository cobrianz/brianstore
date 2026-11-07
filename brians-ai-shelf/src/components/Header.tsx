'use client';

interface Props {
  bagCount: number;
  savedCount: number;
  onBagClick: () => void;
  onSavedClick: () => void;
}

export default function Header({ bagCount, savedCount, onBagClick, onSavedClick }: Props) {
  return (
    <header>
      <div className="wrap top">
        <a className="brand" href="#home">Brian</a>
        <nav className="nav">
          <a href="#shop">Shop</a>
          <a href="#resources">Free guides</a>
          <a href="#about">About Brian</a>
          <a className="nav-cta" href="#newsletter">Get free AI tips&nbsp;↗</a>
        </nav>
        <div className="nav-right">
          <button
            className="saved-btn" type="button"
            aria-label={`Show saved items, ${savedCount} saved`}
            aria-pressed={false} title="Show saved items"
            onClick={onSavedClick}
          >
            <svg className="nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-3.7L6 21V4.5a1 1 0 0 1 1-1Z" />
            </svg>
            <span className="count">{savedCount}</span>
          </button>
          <button
            className="bag-btn" type="button"
            aria-label={`Open cart, ${bagCount} ${bagCount === 1 ? 'item' : 'items'}`}
            title="Open cart"
            onClick={onBagClick}
          >
            <svg className="nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.5L22 8H6" />
              <circle cx="10" cy="20" r="1.2" />
              <circle cx="19" cy="20" r="1.2" />
            </svg>
            <span className="count">{bagCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
