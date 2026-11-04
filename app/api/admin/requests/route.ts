import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import InvitationRequest from '@/models/InvitationRequest';
import { invitationRequestStatusSchema } from '@/schemas/invitation-request';

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const status = req.nextUrl.searchParams.get('status');
    const filter = ['pending', 'reviewing', 'completed', 'declined'].includes(status || '') ? { status } : {};
    const requests = await InvitationRequest.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const counts = await InvitationRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    return NextResponse.json({ requests, counts: Object.fromEntries(counts.map((item: any) => [item._id, item.count])) });
  } catch {
    return NextResponse.json({ error: 'Could not load customer requests.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const status = invitationRequestStatusSchema.safeParse(body.status);
    if (!status.success || typeof body.id !== 'string') return NextResponse.json({ error: 'Invalid request update.' }, { status: 400 });
    await connectDB();
    const request = await InvitationRequest.findByIdAndUpdate(body.id, { status: status.data }, { new: true, runValidators: true });
    return request ? NextResponse.json({ request }) : NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Could not update the request.' }, { status: 500 });
  }
}
