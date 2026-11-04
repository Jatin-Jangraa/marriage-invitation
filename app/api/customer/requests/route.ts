import { NextRequest, NextResponse } from 'next/server';
import { currentAccount } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import InvitationRequest from '@/models/InvitationRequest';
import { invitationRequestSchema } from '@/schemas/invitation-request';

export async function GET() {
  const account = await currentAccount();
  if (!account || account.role !== 'user') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const requests = await InvitationRequest.find({ customer: account.sub }).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ error: 'Could not load your requests.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const account = await currentAccount();
  if (!account || account.role !== 'user') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const parsed = invitationRequestSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Please check the request details.', details: parsed.error.flatten() }, { status: 400 });
    await connectDB();
    const request = await InvitationRequest.create({
      ...parsed.data,
      weddingDate: parsed.data.weddingDate ? new Date(parsed.data.weddingDate) : undefined,
      customer: account.sub,
      customerEmail: account.email,
      customerName: account.name,
    });
    return NextResponse.json({ request }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Could not submit your request.' }, { status: 500 });
  }
}
