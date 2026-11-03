import {redirect} from 'next/navigation';import {adminSession} from '@/lib/auth';import {AnalyticsView} from '@/components/admin/utility-views';
export default async function AnalyticsPage(){if(!await adminSession())redirect('/admin/login');return <AnalyticsView/>}
