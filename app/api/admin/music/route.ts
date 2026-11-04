import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { cloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

const allowedAudioTypes = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/aac',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/webm',
]);

export async function POST(req: NextRequest) {
  const account = await requireAdmin(req);
  if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an audio file to upload.' }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'Audio files must be smaller than 20 MB.' }, { status: 413 });
    if (!allowedAudioTypes.has(file.type)) return NextResponse.json({ error: 'Choose an MP3, M4A, AAC, OGG, WAV, FLAC or WebM audio file.' }, { status: 415 });

    const data = Buffer.from(await file.arrayBuffer());
    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'vivaha/music', resource_type: 'video', use_filename: true, unique_filename: true },
        (error, uploaded) => error ? reject(error) : resolve(uploaded),
      );
      stream.end(data);
    });

    return NextResponse.json({ url: result.secure_url, label: file.name });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Audio upload failed. Check Cloudinary configuration and try again.' }, { status: 500 });
  }
}
