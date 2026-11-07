'use client';

import type { LiveProduct } from './StorePage';

interface Props {
  product: LiveProduct;
  isSaved: boolean;
  onAdd: (id: string) => void;
  onSave: (id: string) => void;
  onOpen: (product: LiveProduct) => void;
}

export default function ProductCard({ product, isSaved, onAdd, onSave, onOpen }: Props) {
  return (
    <article className="product-card">
      <div className="product-cover" onClick={() => onOpen(product)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onOpen(product)}>
        <img src={product.image} alt={`Product photo for ${product.title}`} loading="lazy" />
        <span className="product-tag">{product.category}</span>
        <button className={`save-product${isSaved ? ' on' : ''}`} aria-label="Toggle saved" onClick={e => { e.stopPropagation(); onSave(product.id); }}>
          {isSaved ? '♥' : '♡'}
        </button>
      </div>
      <div className="product-body">
        <div className="product-titleline">
          <h3 className="product-title" onClick={() => onOpen(product)}>{product.title}</h3>
          <span className="product-price">${product.price.toFixed(2)}</span>
        </div>
        <p className="product-desc">{product.description}</p>
        <div className="product-foot">
          <span className="product-format">{product.format}</span>
          <button className="add-to-bag" onClick={() => onAdd(product.id)}>Add to bag +</button>
        </div>
      </div>
    </article>
  );
}
