import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Wedding from '@/models/WeddingInvitation';
import QRCode from 'qrcode';
import { publicUrl } from '@/lib/utils';

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
    const type = req.nextUrl.searchParams.get('type') === 'svg' ? 'svg' : 'png';
    const data = type === 'svg'
      ? await QRCode.toString(`${publicUrl(wedding.slug)}?qr=1`, { type: 'svg', width: 1000, margin: 2, color: { dark: '#4A1024', light: '#FFF8E7' } })
      : await QRCode.toBuffer(`${publicUrl(wedding.slug)}?qr=1`, { width: 1200, margin: 2, color: { dark: '#4A1024', light: '#FFF8E7' } });
    return new NextResponse(data as any, { headers: { 'Content-Type': type === 'svg' ? 'image/svg+xml' : 'image/png', 'Content-Disposition': `attachment; filename="${wedding.slug}-qr.${type}"` } });
  } catch {
    return NextResponse.json({ error: 'Could not generate QR code' }, { status: 500 });
  }
}
