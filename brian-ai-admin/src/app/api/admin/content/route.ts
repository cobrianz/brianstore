import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAndCsrf } from '@/lib/auth';
import { getCollections } from '@/lib/db';
import { contentInput } from '@/lib/utils';

const DEFAULT = {
  heroTitle: "Hey, I'm Brian.",
  heroSubtitle: 'I make AI study simple.',
  aboutText: "I'm Brian, an AI creator and educator. I share accessible tips and practical learning resources.",
  actirovaUrl: 'https://actirova.com/',
  newsletterText: 'Get useful AI tips, tools, and guides in your inbox.',
  tickerText: 'MAKE A THING ✳ LEARN A LITTLE ✳ GET UNSTUCK ✳',
  faqs: [] as any[],
  socialLinks: [] as any[],
};

export async function GET(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const col = await getCollections();
    const doc = await col.content.findOne({ _id: 'main' as any });
    const { _id, ...content } = (doc || DEFAULT) as any;
    return NextResponse.json(content);
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Content could not be loaded.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAuthAndCsrf(req);
    const body = await req.json().catch(() => ({}));
    const content = contentInput(body);
    const col = await getCollections();
    await col.content.updateOne({ _id: 'main' as any }, { $set: content }, { upsert: true });
    return NextResponse.json(content);
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Content could not be saved.' }, { status: 500 });
  }
}
