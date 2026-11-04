import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Wedding from '@/models/WeddingInvitation';
import { requireAdmin } from '@/lib/auth';
import { invitationSchema } from '@/schemas/invitation';

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const page = Math.max(1, Number(req.nextUrl.searchParams.get('page')) || 1);
    const limit = 12;
    const query = req.nextUrl.searchParams.get('q') || '';
    const status = req.nextUrl.searchParams.get('status');
    const filter: any = {};
    if (query) {
      filter.$or = [
        { 'groom.name': { $regex: query, $options: 'i' } },
        { 'bride.name': { $regex: query, $options: 'i' } },
        { slug: { $regex: query, $options: 'i' } },
      ];
      if (/^\d{4}-\d{2}-\d{2}$/.test(query)) {
        const day = new Date(query);
        const end = new Date(day);
        end.setDate(end.getDate() + 1);
        filter['weddingDetails.date'] = { $gte: day, $lt: end };
        delete filter.$or;
      }
    }
    if (status && ['published', 'draft', 'archived'].includes(status)) filter.status = status;
    const sortKey = req.nextUrl.searchParams.get('sort') || 'updatedAt';
    const sortMap: any = { updatedAt: { updatedAt: -1 }, dateAsc: { 'weddingDetails.date': 1 }, dateDesc: { 'weddingDetails.date': -1 }, 'groom.name': { 'groom.name': 1 } };
    const [items, total, totalInvitations, published, drafts] = await Promise.all([
      Wedding.find(filter).sort(sortMap[sortKey] || sortMap.updatedAt).skip((page - 1) * limit).limit(limit).lean(),
      Wedding.countDocuments(filter), Wedding.countDocuments(), Wedding.countDocuments({ status: 'published' }), Wedding.countDocuments({ status: 'draft' }),
    ]);
    return NextResponse.json({ items, total, totalInvitations, published, drafts, page, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Could not load invitations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const parsed = invitationSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Please check the invitation fields.', details: parsed.error.flatten() }, { status: 400 });
    if (parsed.data.status === 'published' && !parsed.data.weddingDetails.date) return NextResponse.json({ error: 'Add a wedding date before publishing.' }, { status: 400 });
    await connectDB();
    const body: any = parsed.data;
    body.events = body.events.filter((event: any) => event.title?.trim());
    const root = body.slug;
    let slug = root;
    let suffix = 2;
    while (await Wedding.exists({ slug })) slug = `${root}-${suffix++}`;
    body.slug = slug;
    if (body.status === 'published') body.publishedAt = new Date();
    const item = await Wedding.create({ ...body, createdBy: admin.sub });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: 'That invitation URL is already in use.' }, { status: 409 });
    return NextResponse.json({ error: 'Could not save invitation' }, { status: 500 });
  }
}
