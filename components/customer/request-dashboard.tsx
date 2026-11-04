'use client';

import { FormEvent, useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { Flower2, LogOut, Send } from 'lucide-react';
import type { Account } from '@/lib/auth';

const emptyForm = { groomName: '', brideName: '', phone: '', weddingDate: '', venue: '', city: '', style: '', notes: '' };
const statusLabels: Record<string, string> = { pending: 'Pending review', reviewing: 'In review', completed: 'Completed', declined: 'Closed' };

export default function RequestDashboard({ account }: { account: Account }) {
  const [form, setForm] = useState(emptyForm);
  const [requests, setRequests] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  async function loadRequests() {
    try {
      const response = await fetch('/api/customer/requests');
      if (!response.ok) throw new Error();
      const data = await response.json();
      setRequests(data.requests || []);
    } catch {
      toast.error('Could not load your requests');
    }
  }

  useEffect(() => { loadRequests(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch('/api/customer/requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not submit your request');
      setForm(emptyForm);
      toast.success('Your invitation request has been sent');
      await loadRequests();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  function update(field: keyof typeof emptyForm, value: string) {
    setForm(current => ({ ...current, [field]: value }));
  }

  const input = 'mt-1.5 w-full rounded-xl border border-[#eadfce] bg-white px-3.5 py-3 text-sm text-ink outline-none focus:border-gold';
  const label = 'block text-xs font-medium text-[#706257]';

  return <main className="min-h-screen bg-[#fcfaf7]">
    <header className="flex items-center justify-between border-b border-[#eee5da] bg-white px-5 py-4 md:px-10">
      <a href="/" className="serif flex items-center gap-2 text-2xl text-burgundy"><Flower2 size={21} className="text-gold"/> vivaha<span className="text-gold">.</span></a>
      <div className="flex items-center gap-4"><span className="hidden text-right sm:block"><span className="block text-sm font-medium">{account.name}</span><span className="text-xs text-[#9a8d81]">{account.email}</span></span><button onClick={() => signOut({ redirectTo: '/' })} className="inline-flex items-center gap-2 text-sm text-[#796e64]"><LogOut size={16}/> Sign out</button></div>
    </header>
    <div className="mx-auto grid max-w-6xl gap-8 p-5 md:grid-cols-[1.1fr_.9fr] md:p-10">
      <section>
        <p className="text-xs uppercase tracking-[.18em] text-[#aa873f]">Customer workspace</p>
        <h1 className="serif mt-2 text-4xl text-burgundy md:text-5xl">Request your invitation<span className="text-gold">.</span></h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#8d8073]">Share the wedding details and the style you have in mind. Our team will review your request and create the invitation for you.</p>
        <form onSubmit={submit} className="card mt-7 space-y-4 rounded-2xl p-5 md:p-7">
          <h2 className="serif text-2xl text-burgundy">Wedding details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>Groom’s name<input required maxLength={120} className={input} value={form.groomName} onChange={e => update('groomName', e.target.value)}/></label>
            <label className={label}>Bride’s name<input required maxLength={120} className={input} value={form.brideName} onChange={e => update('brideName', e.target.value)}/></label>
            <label className={label}>Wedding date<input type="date" className={input} value={form.weddingDate} onChange={e => update('weddingDate', e.target.value)}/></label>
            <label className={label}>Phone number (optional)<input type="tel" maxLength={40} className={input} value={form.phone} onChange={e => update('phone', e.target.value)}/></label>
            <label className={label}>Venue<input maxLength={200} className={input} value={form.venue} onChange={e => update('venue', e.target.value)}/></label>
            <label className={label}>City<input maxLength={120} className={input} value={form.city} onChange={e => update('city', e.target.value)}/></label>
            <label className={`${label} sm:col-span-2`}>Invitation style or theme<input maxLength={120} placeholder="Traditional, floral, royal, minimal…" className={input} value={form.style} onChange={e => update('style', e.target.value)}/></label>
            <label className={`${label} sm:col-span-2`}>Anything else we should know?<textarea rows={4} maxLength={3000} className={input} value={form.notes} onChange={e => update('notes', e.target.value)}/></label>
          </div>
          <p className="text-xs text-[#938477]">We’ll reply to {account.email} about your request.</p>
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-3 text-sm text-white disabled:opacity-50"><Send size={15}/>{busy ? 'Sending…' : 'Send invitation request'}</button>
        </form>
      </section>
      <section>
        <div className="card rounded-2xl p-5 md:p-7">
          <h2 className="serif text-2xl text-burgundy">Your requests</h2>
          <p className="mt-1 text-xs text-[#998a7b]">Track the requests you’ve sent to our team.</p>
          {requests.length === 0 ? <p className="py-10 text-center text-sm text-[#948477]">Your submitted requests will appear here.</p> : <div className="mt-5 space-y-3">{requests.map(request => <article key={request._id} className="rounded-xl border border-[#eee5da] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="serif text-xl text-burgundy">{request.groomName} & {request.brideName}</h3><p className="mt-1 text-xs text-[#948477]">Sent {new Date(request.createdAt).toLocaleDateString()}</p></div><span className="rounded-full bg-[#f6efe3] px-3 py-1 text-[10px] text-[#8b6d3a]">{statusLabels[request.status] || request.status}</span></div>{request.weddingDate && <p className="mt-3 text-xs text-[#75675c]">Wedding date: {new Date(request.weddingDate).toLocaleDateString()}</p>}{request.venue && <p className="mt-1 text-xs text-[#75675c]">Venue: {request.venue}{request.city ? `, ${request.city}` : ''}</p>}</article>)}</div>}
        </div>
      </section>
    </div>
  </main>;
}
