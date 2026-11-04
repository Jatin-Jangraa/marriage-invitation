'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Check, Flower2, RefreshCw } from 'lucide-react';

const statuses = [
  ['pending', 'Pending'],
  ['reviewing', 'In review'],
  ['completed', 'Completed'],
  ['declined', 'Closed'],
] as const;

export default function RequestQueue() {
  const [requests, setRequests] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const router = useRouter();

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/requests${filter ? `?status=${filter}` : ''}`);
      if (response.status === 401) { router.push('/admin/login'); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRequests(data.requests || []);
      setCounts(data.counts || {});
    } catch (error: any) {
      toast.error(error.message || 'Could not load customer requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  async function update(id: string, status: string) {
    setSaving(id);
    try {
      const response = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast.success('Request updated');
      await load();
    } catch (error: any) {
      toast.error(error.message || 'Could not update request');
    } finally {
      setSaving('');
    }
  }

  return <main className="min-h-screen bg-[#fcfaf7]">
    <header className="flex items-center justify-between border-b border-[#eee5da] bg-white px-5 py-4 md:px-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#76695d]"><ArrowLeft size={16}/> Admin dashboard</Link>
      <Link href="/admin/invitations/new" className="rounded-full bg-burgundy px-5 py-2.5 text-sm text-white">Create invitation</Link>
    </header>
    <div className="mx-auto max-w-6xl p-5 md:p-10">
      <p className="text-xs uppercase tracking-[.18em] text-[#aa873f]">Customer service</p>
      <h1 className="serif mt-2 text-4xl text-burgundy md:text-5xl">Invitation requests<span className="text-gold">.</span></h1>
      <p className="mt-2 text-sm text-[#8d8073]">Review customer details, follow up, and create invitations from the admin studio.</p>
      <div className="mt-7 flex flex-wrap gap-2">{[['', 'All'], ...statuses].map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-xs ${filter === value ? 'bg-burgundy text-white' : 'border border-[#eadfce] bg-white text-[#76695d]'}`}>{label} {value ? `(${counts[value] || 0})` : `(${Object.values(counts).reduce((sum, count) => sum + count, 0)})`}</button>)}</div>
      {loading ? <div className="card mt-5 rounded-2xl p-12 text-center text-sm text-[#948477]">Loading requests…</div> : requests.length === 0 ? <div className="card mt-5 rounded-2xl p-12 text-center"><Flower2 className="mx-auto text-gold"/><p className="serif mt-3 text-2xl text-burgundy">No requests in this view</p><p className="mt-1 text-sm text-[#948477]">New customer requests will appear here.</p></div> : <div className="mt-5 space-y-4">{requests.map(request => <article key={request._id} className="card rounded-2xl p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="serif text-2xl text-burgundy">{request.groomName} & {request.brideName}</h2><p className="mt-1 text-xs text-[#948477]">From {request.customerName} · <a className="text-gold" href={`mailto:${request.customerEmail}`}>{request.customerEmail}</a>{request.phone ? ` · ${request.phone}` : ''}</p><p className="mt-1 text-xs text-[#948477]">Submitted {new Date(request.createdAt).toLocaleString()}</p></div><span className="rounded-full bg-[#f6efe3] px-3 py-1 text-[11px] capitalize text-[#8b6d3a]">{request.status}</span></div>
        <div className="mt-5 grid gap-3 text-sm text-[#66584c] sm:grid-cols-2 lg:grid-cols-3">{request.weddingDate && <p><strong>Wedding date:</strong> {new Date(request.weddingDate).toLocaleDateString()}</p>}{request.venue && <p><strong>Venue:</strong> {request.venue}</p>}{request.city && <p><strong>City:</strong> {request.city}</p>}{request.style && <p><strong>Style:</strong> {request.style}</p>}</div>
        {request.notes && <div className="mt-4 rounded-xl bg-[#fbf6ed] p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-[#a09283]">Customer notes</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#66584c]">{request.notes}</p></div>}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#eee5da] pt-4"><Link href="/admin/invitations/new" className="rounded-full bg-burgundy px-4 py-2.5 text-xs text-white">Create invitation</Link>{statuses.filter(([value]) => value !== request.status).map(([value, label]) => <button key={value} disabled={saving === request._id} onClick={() => update(request._id, value)} className="inline-flex items-center gap-1 rounded-full border border-[#eadfce] px-4 py-2.5 text-xs text-[#76695d] disabled:opacity-50">{value === 'completed' && <Check size={13}/>} {saving === request._id ? <RefreshCw size={13} className="animate-spin"/> : label}</button>)}</div>
      </article>)}</div>}
    </div>
  </main>;
}
