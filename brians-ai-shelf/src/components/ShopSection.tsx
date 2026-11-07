'use client';

import { useState, useMemo } from 'react';
import type { LiveProduct } from './StorePage';
import ProductCard from './ProductCard';

const FILTERS = ['All', 'AI Prompts', 'Ebooks', 'Learning', 'Saved'];

interface Props {
  products: LiveProduct[];
  saved: string[];
  onAdd: (id: string) => void;
  onSave: (id: string) => void;
  onOpen: (product: LiveProduct) => void;
}

export default function ShopSection({ products, saved, onAdd, onSave, onOpen }: Props) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');

  // Collect unique categories from live products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats), 'Saved'];
  }, [products]);

  const visible = useMemo(() => {
    let list = products.filter(p => {
      const matchCat = category === 'All' || category === 'Saved' || p.category === category;
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchSaved = category !== 'Saved' || saved.includes(p.id) || saved.includes(p.slug);
      return matchCat && matchSearch && matchSaved;
    });
    if (sort === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'za') list = [...list].sort((a, b) => b.title.localeCompare(a.title));
    if (sort === 'price') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'featured') list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [products, category, search, sort, saved]);

  return (
    <section className="wrap shop" id="shop">
      <div className="section-head">
        <div>
          <div className="kicker">Small digital goods</div>
          <h2>Tools for your next idea.</h2>
        </div>
        <p>Prompt packs, guides, and learning tools · $5 each.</p>
      </div>

      <div className="shop-tools">
        <div className="filters">
          {categories.map(f => (
            <button key={f} className={`filter${category === f ? ' active' : ''}`} onClick={() => setCategory(f)}>
              {f === 'Ebooks' ? 'Ebooks & guides' : f}
            </button>
          ))}
        </div>
        <div className="search-sort">
          <input className="searchbox" type="search" placeholder="Search products…" aria-label="Search products" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="sort" aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="az">Name: A–Z</option>
            <option value="za">Name: Z–A</option>
            <option value="price">Price: low to high</option>
          </select>
        </div>
      </div>

      <div className="results">
        {visible.length} {visible.length === 1 ? 'ITEM' : 'ITEMS'}{category === 'Saved' ? ' · SAVED' : ''}
      </div>

      <div className="product-grid">
        {visible.length > 0
          ? visible.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                isSaved={saved.includes(p.id) || saved.includes(p.slug)}
                onAdd={onAdd}
                onSave={onSave}
                onOpen={onOpen}
              />
            ))
          : <div className="no-products">{products.length === 0 ? 'Products coming soon.' : 'No matches. Try another category or search.'}</div>}
      </div>
    </section>
  );
}
