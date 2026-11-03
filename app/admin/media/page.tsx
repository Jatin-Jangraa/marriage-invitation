import {redirect} from 'next/navigation';import {adminSession} from '@/lib/auth';import {MediaView} from '@/components/admin/utility-views';
export default async function MediaPage(){if(!await adminSession())redirect('/admin/login');return <MediaView/>}
