import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStoreCollections } from '@/lib/db';

export const dynamic = 'force-dynamic';

function renderInline(markdown: string) {
  const tokens = markdown.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g);
  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={index}>{token.slice(1, -1)}</code>;
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    return token;
  });
}

function renderGuideBody(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const Heading = heading[1].length === 1 ? 'h2' : heading[1].length === 2 ? 'h2' : 'h3';
      blocks.push(<Heading key={index}>{renderInline(heading[2])}</Heading>);
      index += 1;
      continue;
    }

    const listType = /^[-*]\s+/.test(line) ? 'unordered' : /^\d+[.)]\s+/.test(line) ? 'ordered' : null;
    if (listType) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = listType === 'unordered'
          ? /^[-*]\s+(.+)$/.exec(lines[index].trim())
          : /^\d+[.)]\s+(.+)$/.exec(lines[index].trim());
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      const List = listType === 'unordered' ? 'ul' : 'ol';
      blocks.push(
        <List key={index}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
        </List>,
      );
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,3})\s+|[-*]\s+|\d+[.)]\s+/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={index}>{renderInline(paragraph.join(' '))}</p>);
  }

  return blocks;
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = (await getStoreCollections()).guides;
  const guide = await collection.findOne({ slug, status: 'published' });

  if (!guide) notFound();

  return (
    <main className="guide-page">
      <div className="guide-wrap">
        <Link className="guide-back" href="/#resources">← All free guides</Link>
        <article className="guide-article">
          <p className="guide-kicker">{guide.category || 'Free guide'}</p>
          <h1>{guide.title}</h1>
          {guide.summary && <p className="guide-summary">{guide.summary}</p>}
          <div className="guide-body">{renderGuideBody(guide.bodyMarkdown || '')}</div>
          <Link className="guide-back guide-bottom-link" href="/#resources">Explore more free guides →</Link>
        </article>
      </div>
    </main>
  );
}
