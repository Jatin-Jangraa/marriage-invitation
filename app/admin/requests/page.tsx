import { redirect } from 'next/navigation';
import { adminSession } from '@/lib/auth';
import RequestQueue from '@/components/admin/request-queue';

export default async function AdminRequestsPage() {
  if (!await adminSession()) redirect('/admin/login');
  return <RequestQueue/>;
}
