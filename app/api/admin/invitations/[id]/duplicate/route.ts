import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Wedding from '@/models/WeddingInvitation';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await requireAdmin(req);
  if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const { id } = await params;
    const source = await Wedding.findById(id).lean() as any;
    if (!source || (account.role !== 'admin' && String(source.createdBy) !== account.sub)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const root = slugify(`${source.groom?.name || 'new'}-weds-${source.bride?.name || 'couple'}-copy`);
    let slug = root;
    let n = 2;
    while (await Wedding.exists({ slug })) slug = `${root}-${n++}`;
    const { _id, createdAt, updatedAt, publishedAt, status, ...rest } = source;
    const copy = await Wedding.create({ ...rest, slug, status: 'draft', publishedAt: undefined, createdBy: account.sub });
    return NextResponse.json({ item: copy }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Could not duplicate invitation' }, { status: 500 });
  }
}
