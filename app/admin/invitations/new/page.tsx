import {redirect} from 'next/navigation';import {adminSession} from '@/lib/auth';import InvitationEditor from '@/components/admin/invitation-editor';
export default async function NewInvitation(){if(!await adminSession())redirect('/admin/login');return <InvitationEditor/>}
