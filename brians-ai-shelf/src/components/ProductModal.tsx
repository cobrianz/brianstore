'use client';

import { useEffect } from 'react';
import type { LiveProduct } from './StorePage';

interface Props {
  product: LiveProduct;
  onClose: () => void;
  onAdd: (id: string) => void;
}

export default function ProductModal({ product, onClose, onAdd }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="product-modal-wrap open" onClick={e => { if ((e.target as HTMLElement).classList.contains('product-modal-wrap')) onClose(); }}>
      <div className="product-modal">
        <img src={product.image} alt={`Product photo for ${product.title}`} />
        <div className="product-modal-copy">
          <button className="close-btn modal-close-btn" aria-label="Close details" onClick={onClose}>×</button>
          <div className="modal-label">{product.category} · DIGITAL DOWNLOAD</div>
          <h2>{product.title}</h2>
          <p>{product.detail || product.description}</p>
          {product.includes?.length > 0 && (
            <>
              <p><strong>Included in this download:</strong></p>
              <ul>{product.includes.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </>
          )}
          <div className="modal-price-row">
            <div className="modal-price">${product.price.toFixed(2)} <small>· DIGITAL DOWNLOAD</small></div>
            <button className="add-to-bag" onClick={() => { onAdd(product.id); onClose(); }}>Add to bag +</button>
          </div>
          <p style={{ marginTop: 12 }}><small>Your file is delivered securely from Cloudflare after payment is verified by Paystack.</small></p>
        </div>
      </div>
    </div>
  );
}
