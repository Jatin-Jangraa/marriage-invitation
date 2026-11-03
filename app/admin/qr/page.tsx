import {redirect} from 'next/navigation';import {adminSession} from '@/lib/auth';import {QrView} from '@/components/admin/utility-views';
export default async function QrPage(){if(!await adminSession())redirect('/admin/login');return <QrView/>}
