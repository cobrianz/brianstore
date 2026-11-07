import path from 'node:path';

export function cleanText(value: unknown, max = 2000): string {
  return String(value ?? '').trim().slice(0, max);
}

export function slugify(value: string): string {
  return cleanText(value, 120)
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 100);
}

export function validSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function validHttpUrl(value: unknown, fallback = ''): string {
  const text = cleanText(value, 500);
  if (!text) return fallback;
  try {
    const url = new URL(text);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
      ? url.toString() : fallback;
  } catch { return fallback; }
}

export function fileNameSafe(value: unknown): string {
  const name = path.basename(String(value || 'download'))
    .replace(/[\r\n"\\/]/g, '_').slice(0, 180);
  return name || 'download';
}

export function emailValid(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function productInput(body: any, existing: any = {}) {
  const title = cleanText(body.title ?? existing.title, 160);
  const slug = slugify(body.slug ?? existing.slug ?? title);
  const priceCents = Number(body.priceCents ?? existing.priceCents ?? 0);
  const status = body.status ?? existing.status ?? 'draft';
  if (!title) throw new Error('Product title is required.');
  if (!slug || !validSlug(slug)) throw new Error('Use a simple product slug (letters, numbers, hyphens).');
  if (!Number.isSafeInteger(priceCents) || priceCents < 0) throw new Error('Price must be a non-negative amount in cents.');
  if (!['draft', 'published'].includes(status)) throw new Error('Choose draft or published status.');
  return {
    title, slug,
    description: cleanText(body.description ?? existing.description, 5000),
    priceCents,
    currency: 'USD',
    category: cleanText(body.category ?? existing.category ?? 'learning', 60),
    status,
    featured: body.featured === undefined ? Boolean(existing.featured) : Boolean(body.featured),
    coverKey: cleanText(body.coverKey ?? existing.coverKey, 1024),
    fileKey: cleanText(body.fileKey ?? existing.fileKey, 1024),
    fileName: fileNameSafe(body.fileName ?? existing.fileName ?? title.replace(/\s+/g, '-') + '.pdf'),
    updatedAt: new Date(),
  };
}

export function guideInput(body: any, existing: any = {}) {
  const title = cleanText(body.title ?? existing.title, 160);
  const slug = slugify(body.slug ?? existing.slug ?? title);
  const status = body.status ?? existing.status ?? 'draft';
  if (!title) throw new Error('Guide title is required.');
  if (!slug || !validSlug(slug)) throw new Error('Use a simple guide slug.');
  if (!['draft', 'published'].includes(status)) throw new Error('Choose draft or published status.');
  return {
    title, slug,
    summary: cleanText(body.summary ?? existing.summary, 1000),
    bodyMarkdown: cleanText(body.bodyMarkdown ?? existing.bodyMarkdown, 20000),
    category: cleanText(body.category ?? existing.category ?? 'free-guide', 60),
    status,
    coverKey: cleanText(body.coverKey ?? existing.coverKey, 1024),
    publicUrl: validHttpUrl(body.publicUrl ?? existing.publicUrl, ''),
    updatedAt: new Date(),
  };
}

export function contentInput(body: any = {}) {
  const faqs = Array.isArray(body.faqs)
    ? body.faqs.slice(0, 20).map((r: any) => ({
        question: cleanText(r?.question, 240),
        answer: cleanText(r?.answer, 2000),
      })).filter((r: any) => r.question && r.answer)
    : [];
  const socialLinks = Array.isArray(body.socialLinks)
    ? body.socialLinks.slice(0, 20).map((r: any) => ({
        label: cleanText(r?.label, 60),
        url: validHttpUrl(r?.url, ''),
      })).filter((r: any) => r.label && r.url)
    : [];
  return {
    heroTitle: cleanText(body.heroTitle, 240),
    heroSubtitle: cleanText(body.heroSubtitle, 1000),
    aboutText: cleanText(body.aboutText, 4000),
    actirovaUrl: validHttpUrl(body.actirovaUrl, 'https://actirova.com/'),
    newsletterText: cleanText(body.newsletterText, 1000),
    tickerText: cleanText(body.tickerText, 500),
    faqs,
    socialLinks,
    updatedAt: new Date(),
  };
}
