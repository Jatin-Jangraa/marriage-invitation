import {redirect} from 'next/navigation';import {adminSession} from '@/lib/auth';import AdminDashboard from '@/components/admin/dashboard';
export default async function AdminPage(){if(!await adminSession())redirect('/admin/login');return <AdminDashboard/>}
