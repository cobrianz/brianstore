'use client';

import { useCallback, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import Header from './Header';
import Hero from './Hero';
import Ticker from './Ticker';
import FeaturedResources from './FeaturedResources';
import ShopSection from './ShopSection';
import AboutSection from './AboutSection';
import FaqSection from './FaqSection';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ProductModal from './ProductModal';
import Toast from './Toast';

export interface LiveProduct {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  detail: string;
  includes: string[];
  image: string;
  format: string;
  price: number;
  amount: number;
  featured: boolean;
}

export interface LiveGuide {
  id: string;
  slug: string;
  title: string;
  desc: string;
  label: string;
  img: string;
  publicUrl: string;
}

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  actirovaUrl: string;
  newsletterText: string;
  tickerText: string;
  faqs: { question: string; answer: string }[];
  socialLinks: { label: string; url: string }[];
}

interface Props {
  products: LiveProduct[];
  guides: LiveGuide[];
  content: SiteContent | null;
}

export default function StorePage({ products, guides, content }: Props) {
  const {
    bag, saved, cartOpen, activeProduct, toast,
    paymentReady, paymentReason,
    addToBag, removeFromBag, toggleSaved,
    openCart, closeCart, openProduct, closeProduct, closeAll,
  } = useStore();

  const showProduct = useCallback((product: LiveProduct) => {
    const url = new URL(window.location.href);
    url.searchParams.set('product', product.slug);
    window.history.replaceState(window.history.state, '', url);
    openProduct(product);
  }, [openProduct]);

  const hideProduct = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    window.history.replaceState(window.history.state, '', url);
    closeProduct();
  }, [closeProduct]);

  const hideAll = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    window.history.replaceState(window.history.state, '', url);
    closeAll();
  }, [closeAll]);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('product');
    const product = products.find(item => item.slug === slug);
    if (product) openProduct(product);
  }, [products, openProduct]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hideAll(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hideAll]);

  const overlayOpen = cartOpen || !!activeProduct;

  return (
    <>
      <Header
        bagCount={bag.length}
        savedCount={saved.length}
        onBagClick={openCart}
        onSavedClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
      />

      <main id="home">
        <Hero content={content} />
        <Ticker tickerText={content?.tickerText} />
        <FeaturedResources guides={guides} />
        <ShopSection
          products={products}
          saved={saved}
          onAdd={addToBag}
          onSave={toggleSaved}
          onOpen={showProduct}
        />
        <AboutSection content={content} />
      </main>

      <FaqSection faqs={content?.faqs} />
      <Footer />

      <div className={`overlay${overlayOpen ? ' open' : ''}`} onClick={hideAll} />

      <CartDrawer
        bag={bag}
        products={products}
        isOpen={cartOpen}
        paymentReady={paymentReady}
        paymentReason={paymentReason}
        onRemove={removeFromBag}
        onClose={closeCart}
      />

      {activeProduct && (
        <ProductModal
          product={activeProduct as LiveProduct}
          onClose={hideProduct}
          onAdd={(id) => { addToBag(id); hideProduct(); }}
        />
      )}

      <Toast message={toast} />
    </>
  );
}
