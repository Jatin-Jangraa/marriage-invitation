import { auth } from '@/auth';
import type { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export type Account = {
  sub: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
};

export async function currentAccount(): Promise<Account | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;
  await connectDB();
  const user = await User.findById(session.user.id).select('_id email name role').lean() as any;
  if (!user) return null;
  return {
    sub: String(user._id),
    email: user.email,
    name: user.name || user.email,
    role: user.role === 'admin' ? 'admin' : 'user',
  };
}

export async function adminSession(): Promise<(Account & { role: 'admin' }) | null> {
  const account = await currentAccount();
  return account?.role === 'admin' ? account as Account & { role: 'admin' } : null;
}

export async function requireAdmin(_request?: NextRequest) {
  return adminSession();
}
