import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Wedding from '@/models/WeddingInvitation';
import QRCode from 'qrcode';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await requireAdmin(req);
  if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const { id } = await params;
    const wedding = await Wedding.findById(id).lean() as any;
    if (!wedding || (account.role !== 'admin' && String(wedding.createdBy) !== account.sub)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const host = forwardedHost || req.headers.get('host') || req.nextUrl.host;
    const protocol = forwardedProto || req.nextUrl.protocol.replace(':', '');
    const target = new URL(`/invite/${encodeURIComponent(wedding.slug)}`, `${protocol}://${host}`);
    target.searchParams.set('qr', '1');
    const targetUrl = target.toString();
    const type = req.nextUrl.searchParams.get('type') === 'svg' ? 'svg' : 'png';
    const data = type === 'svg'
      ? await QRCode.toString(targetUrl, { type: 'svg', width: 1000, margin: 2, color: { dark: '#4A1024', light: '#FFF8E7' } })
      : await QRCode.toBuffer(targetUrl, { width: 1200, margin: 2, color: { dark: '#4A1024', light: '#FFF8E7' } });
    return new NextResponse(data as any, { headers: { 'Content-Type': type === 'svg' ? 'image/svg+xml' : 'image/png', 'Content-Disposition': `attachment; filename="${wedding.slug}-qr.${type}"` } });
  } catch {
    return NextResponse.json({ error: 'Could not generate QR code' }, { status: 500 });
  }
}
