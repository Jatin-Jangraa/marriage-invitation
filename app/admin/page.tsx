import {redirect} from 'next/navigation';import {adminSession} from '@/lib/auth';import InvitationDashboard from '@/components/admin/dashboard';
export default async function AdminPage(){const account=await adminSession();if(!account)redirect('/admin/login');return <InvitationDashboard account={account}/>}
