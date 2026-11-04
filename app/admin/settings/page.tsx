import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Cloud, Database, KeyRound, ShieldCheck } from 'lucide-react';
import { adminSession } from '@/lib/auth';

export default async function SettingsPage() {
  const account = await adminSession();
  if (!account) redirect('/admin/login');

  const settings = [
    [ShieldCheck, 'Administrator account', account.email, 'Your role is read from the User record in MongoDB.'],
    [Database, 'MongoDB Atlas', process.env.MONGODB_URI ? 'Configured' : 'Needs configuration', 'Users, invitation requests, and invitations are stored in MongoDB.'],
    [Cloud, 'Cloudinary media', process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Needs configuration', 'Uploaded invitation photos are stored in Cloudinary.'],
    [KeyRound, 'Google OAuth', process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? 'Configured' : 'Needs configuration', 'Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in the hosting environment.'],
    [KeyRound, 'Session security', process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32 ? 'Configured' : 'Needs a 32+ character secret', 'Set AUTH_SECRET in the hosting environment before deployment.'],
  ] as const;

  return <main className="mx-auto min-h-screen max-w-4xl p-6 md:p-10">
    <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#78695d]"><ArrowLeft size={16}/> Dashboard</Link>
    <h1 className="serif mt-7 text-4xl text-burgundy">Studio settings</h1>
    <p className="mt-2 text-sm text-[#8d8073]">Administrator and service configuration.</p>
    <div className="mt-8 grid gap-4">{settings.map(([Icon, title, value, detail]) => <section key={title} className="card flex gap-4 rounded-2xl p-5"><Icon className="mt-1 shrink-0 text-gold" size={20}/><div><h2 className="font-medium text-burgundy">{title}</h2><p className="mt-1 text-sm">{value}</p><p className="mt-1 text-xs text-[#948477]">{detail}</p></div></section>)}</div>
    <p className="mt-6 text-xs leading-6 text-[#8d8073]">User roles are stored in MongoDB. New Google accounts receive the user role. Change a trusted account’s role to admin in the Users collection to grant administrator access.</p>
  </main>;
}
