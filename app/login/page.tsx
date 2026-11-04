import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Flower2 } from 'lucide-react';
import { currentAccount } from '@/lib/auth';
import GoogleLogin from '@/components/auth/google-login';

export default async function CustomerLogin() {
  const account = await currentAccount();
  if (account) redirect(account.role === 'admin' ? '/admin' : '/customer');

  return (
    <main className="grid min-h-screen bg-ivory md:grid-cols-2">
      <div className="hidden bg-burgundy p-12 text-ivory md:flex md:flex-col md:justify-between">
        <Link href="/" className="serif text-3xl">vivaha<span className="text-gold">.</span></Link>
        <div className="max-w-md"><p className="mb-4 text-xs uppercase tracking-[.22em] text-gold">Your invitation request</p><h1 className="serif text-6xl leading-tight">Share your story. We’ll create the invitation.</h1></div>
        <p className="text-xs tracking-wide text-[#d9c8b8]">Send us your wedding details and follow the request.</p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-12 inline-flex items-center gap-2 text-sm text-[#87776c]"><ArrowLeft size={15}/> Back to home</Link>
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#f2e4d2] text-burgundy"><Flower2 size={20}/></div>
          <h2 className="serif text-4xl text-burgundy">Welcome</h2>
          <p className="mt-2 text-sm text-[#827469]">Sign in to request an invitation and track its progress.</p>
          <div className="mt-8"><GoogleLogin audience="customer"/></div>
          <p className="mt-6 text-xs leading-5 text-[#97887a]">Your requests are private to your account. Our admin team creates and manages invitation cards.</p>
          <Link href="/admin/login" className="mt-6 block text-center text-xs text-gold">Administrator? Sign in here</Link>
        </div>
      </div>
    </main>
  );
}
