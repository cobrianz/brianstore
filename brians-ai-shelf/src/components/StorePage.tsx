'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAll(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeAll]);

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
          onOpen={openProduct}
        />
        <AboutSection content={content} />
      </main>

      <FaqSection faqs={content?.faqs} />
      <Footer />

      <div className={`overlay${overlayOpen ? ' open' : ''}`} onClick={closeAll} />

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
          onClose={closeProduct}
          onAdd={(id) => { addToBag(id); closeProduct(); }}
        />
      )}

      <Toast message={toast} />
    </>
  );
}
