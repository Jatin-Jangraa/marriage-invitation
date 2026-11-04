import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Wedding from '@/models/WeddingInvitation';
import { requireAdmin } from '@/lib/auth';
import { invitationSchema } from '@/schemas/invitation';

type Context = { params: Promise<{ id: string }> };

async function ownedInvitation(id: string, account: { sub: string; role: string }) {
  const invitation = await Wedding.findById(id);
  if (!invitation) return null;
  if (account.role !== 'admin' && String(invitation.createdBy) !== account.sub) return null;
  return invitation;
}

export async function GET(req: NextRequest, { params }: Context) {
  const account = await requireAdmin(req);
  if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const { id } = await params;
    const item = await ownedInvitation(id, account);
    return item ? NextResponse.json({ item }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Could not load invitation' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const account = await requireAdmin(req);
  if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const parsed = invitationSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Please check the invitation fields.', details: parsed.error.flatten() }, { status: 400 });
    if (parsed.data.status === 'published' && !parsed.data.weddingDetails.date) return NextResponse.json({ error: 'Add a wedding date before publishing.' }, { status: 400 });
    await connectDB();
    const { id } = await params;
    const existing = await ownedInvitation(id, account);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await Wedding.findByIdAndUpdate(id, { ...parsed.data, ...(parsed.data.status === 'published' ? { publishedAt: new Date() } : {}) }, { new: true, runValidators: true });
    return item ? NextResponse.json({ item }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (e: any) {
    if (e.code === 11000) return NextResponse.json({ error: 'That invitation URL is already in use.' }, { status: 409 });
    return NextResponse.json({ error: 'Could not update invitation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const account = await requireAdmin(req);
  if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const { id } = await params;
    const existing = await ownedInvitation(id, account);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await existing.deleteOne();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not delete invitation' }, { status: 400 });
  }
}
