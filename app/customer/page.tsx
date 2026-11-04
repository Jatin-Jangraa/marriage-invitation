import { redirect } from 'next/navigation';
import { currentAccount } from '@/lib/auth';
import RequestDashboard from '@/components/customer/request-dashboard';

export default async function CustomerPage() {
  const account = await currentAccount();
  if (!account) redirect('/login');
  if (account.role === 'admin') redirect('/admin');
  return <RequestDashboard account={account}/>;
}
