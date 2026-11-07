import { getStoreCollections } from '@/lib/db';
import StorePage from '@/components/StorePage';

export const dynamic = 'force-dynamic'; // always fetch live data, never at build time

async function getStoreData() {
  try {
    const col = await getStoreCollections();

    const [productsRaw, guidesRaw, contentRaw] = await Promise.all([
      col.products.find({ status: 'published' }).sort({ featured: -1, updatedAt: -1 }).limit(100).toArray(),
      col.guides.find({ status: 'published' }).sort({ updatedAt: -1 }).limit(100).toArray(),
      col.content.findOne({ _id: 'main' as any }),
    ]);

    const products = productsRaw.map(p => {
      const coverUrl = p.coverKey
        ? `/api/image?key=${encodeURIComponent(p.coverKey)}`
        : '/assets/photo-guide.webp';
      return {
        id: String(p._id),
        slug: p.slug,
        title: p.title,
        category: p.category || 'Learning',
        description: p.description || '',
        detail: p.description || '',
        includes: p.includes || [],
        image: coverUrl,
        format: `${(p.category || 'DIGITAL').toUpperCase()} · PDF`,
        price: (Number(p.priceCents) || 0) / 100,
        amount: Number(p.priceCents) || 0,
        featured: Boolean(p.featured),
      };
    });

    const guides = guidesRaw.map(g => {
      const coverUrl = g.coverKey
        ? `/api/image?key=${encodeURIComponent(g.coverKey)}`
        : '/assets/photo-guide.webp';
      return {
        id: String(g._id),
        slug: g.slug,
        title: g.title,
        desc: g.summary || '',
        label: g.category || 'Free guide',
        img: coverUrl,
        publicUrl: g.publicUrl || '#resources',
      };
    });

    const content = contentRaw ? {
      heroTitle: contentRaw.heroTitle || "Hey, I'm Brian.",
      heroSubtitle: contentRaw.heroSubtitle || 'I make AI study simple.',
      aboutText: contentRaw.aboutText || '',
      actirovaUrl: contentRaw.actirovaUrl || 'https://actirova.com/',
      newsletterText: contentRaw.newsletterText || '',
      tickerText: contentRaw.tickerText || 'MAKE A THING ✳ LEARN A LITTLE ✳ GET UNSTUCK ✳',
      faqs: contentRaw.faqs || [],
      socialLinks: contentRaw.socialLinks || [],
    } : null;

    return { products, guides, content };
  } catch (e) {
    console.error('Failed to load store data from MongoDB:', e);
    return { products: [], guides: [], content: null };
  }
}

export default async function Home() {
  const { products, guides, content } = await getStoreData();
  return <StorePage products={products} guides={guides} content={content} />;
}
