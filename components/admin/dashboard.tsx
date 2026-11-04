'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { CalendarDays, ChartNoAxesCombined, ClipboardList, Copy, ExternalLink, Flower2, Heart, Image as ImageIcon, LayoutDashboard, LogOut, Menu, MoreHorizontal, Plus, QrCode, Search, Settings, Trash2, X, Eye } from 'lucide-react';
import type { Account } from '@/lib/auth';

export default function InvitationDashboard({ account }: { account: Account }) {
  const isAdmin = account.role === 'admin';
  const base = isAdmin ? '/admin' : '/customer';
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>({});
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState('updatedAt');
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState(false);
  const router = useRouter();

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, status, page: String(page), sort });
      const [response, analytics] = await Promise.all([
        fetch('/api/admin/invitations?' + params),
        isAdmin ? fetch('/api/admin/analytics') : Promise.resolve(null),
      ]);
      if (response.status === 401) { router.push(isAdmin ? '/admin/login' : '/login'); return; }
      const data = await response.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      if (isAdmin && analytics) setStats(await analytics.json());
      else setStats(data);
    } catch {
      toast.error('Could not load invitations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const timer = setTimeout(load, 180); return () => clearTimeout(timer); }, [query, status, page, sort]);

  async function remove(id: string) {
    if (!confirm('Delete this invitation? This keeps its uploaded media safe.')) return;
    const response = await fetch('/api/admin/invitations/' + id, { method: 'DELETE' });
    if (response.ok) { toast.success('Invitation deleted'); load(); }
    else toast.error('Could not delete invitation');
  }

  async function duplicate(id: string) {
    const response = await fetch(`/api/admin/invitations/${id}/duplicate`, { method: 'POST' });
    const data = await response.json();
    if (response.ok) { toast.success('Draft copy created'); router.push(`${base}/invitations/${data.item._id}/edit`); }
    else toast.error(data.error);
  }

  const nav = isAdmin
    ? [['Overview', '/admin', LayoutDashboard], ['Invitations', '/admin', Heart], ['Customer requests', '/admin/requests', ClipboardList], ['Media library', '/admin/media', ImageIcon], ['QR codes', '/admin/qr', QrCode], ['Analytics', '/admin/analytics', ChartNoAxesCombined], ['Settings', '/admin/settings', Settings]] as const
    : [['My invitations', '/customer', Heart]] as const;

  return <div className="min-h-screen bg-[#fcfaf7] md:flex">
    <aside className={`${mobile ? 'fixed inset-0 z-30' : 'hidden'} w-[260px] border-r border-[#eee5da] bg-white p-6 md:sticky md:top-0 md:flex md:h-screen md:flex-col`}>
      <Link href="/" className="serif mb-10 flex items-center gap-2 text-3xl text-burgundy"><Flower2 size={22} className="text-gold"/> vivaha<span className="text-gold">.</span></Link>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.2em] text-[#a09283]">Workspace</p>
      <nav className="space-y-1">{nav.map(([label, href, Icon]) => <Link key={label} href={href} onClick={() => setMobile(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#796e64] hover:bg-[#fbf8f4]"><Icon size={17}/>{label}</Link>)}</nav>
      {isAdmin && <div className="mt-auto rounded-2xl bg-[#fbf6ed] p-4"><p className="serif text-xl text-burgundy">A little more lovely</p><p className="mt-1 text-xs leading-5 text-[#8c7b6c]">Every detail makes a difference.</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eadfce]"><div className="h-full w-2/3 rounded-full bg-gold"/></div></div>}
      <button onClick={() => signOut({ redirectTo: '/' })} className="mt-auto flex items-center gap-3 px-3 py-2 text-sm text-[#796e64] hover:text-wine"><LogOut size={17}/> Sign out</button>
    </aside>
    <main className="min-w-0 flex-1">
      <header className="flex items-center justify-between border-b border-[#eee5da] bg-white/80 px-5 py-4 md:px-10">
        <button onClick={() => setMobile(true)} className="md:hidden"><Menu/></button>
        <div className="hidden text-sm text-[#8e8073] md:block">Your invitation studio <span className="mx-2 text-gold">/</span> <span className="text-burgundy">{isAdmin ? 'Administrator' : account.name}</span></div>
        <div className="flex items-center gap-3"><span className="hidden text-right sm:block"><span className="block text-sm font-medium">{account.name}</span><span className="text-xs capitalize text-[#9a8d81]">{account.role}</span></span><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-burgundy font-serif text-white">{account.name?.[0]?.toUpperCase() || 'V'}</div></div>
        {mobile && <button onClick={() => setMobile(false)} className="fixed right-5 top-5 z-40 md:hidden"><X/></button>}
      </header>
      <div className="mx-auto max-w-7xl p-5 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.18em] text-[#aa873f]">Administrator workspace</p><h1 className="serif mt-2 text-4xl text-burgundy md:text-5xl">Invitation studio<span className="text-gold">.</span></h1><p className="mt-2 text-sm text-[#8d8073]">Review customer requests and create invitations.</p></div><Link href="/admin/invitations/new" className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-3 text-sm text-white shadow-luxe hover:bg-wine"><Plus size={16}/> Create invitation</Link></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">{[['Your invitations', stats.totalInvitations ?? total, Heart], ['Published', stats.published ?? '—', Eye], ['Drafts', stats.drafts ?? '—', CalendarDays]].map(([label, value, Icon]: any) => <div key={label} className="card rounded-2xl p-5"><div className="flex items-center justify-between"><p className="text-sm text-[#8d8073]">{label}</p><Icon size={18} className="text-gold"/></div><p className="serif mt-3 text-4xl text-burgundy">{value}</p></div>)}</div>
        <section className="card mt-8 overflow-hidden rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eee5da] p-5"><div><h2 className="serif text-2xl text-burgundy">{isAdmin ? 'All invitations' : 'Your invitations'}</h2><p className="mt-1 text-xs text-[#998a7b]">Keep every detail of each celebration in one place.</p></div><div className="flex w-full gap-2 sm:w-auto"><label className="flex flex-1 items-center gap-2 rounded-xl border border-[#eadfce] bg-white px-3 sm:w-56"><Search size={15} className="text-[#a19383]"/><input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Search couples…" className="w-full py-2.5 text-sm outline-none"/></label><select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-[#eadfce] bg-white px-3 text-sm text-[#66584c]"><option value="">All status</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select><select value={sort} onChange={e => setSort(e.target.value)} className="rounded-xl border border-[#eadfce] bg-white px-3 text-sm text-[#66584c]"><option value="updatedAt">Recently updated</option><option value="dateAsc">Wedding date ↑</option><option value="dateDesc">Wedding date ↓</option><option value="groom.name">Groom name A–Z</option></select></div></div>
          {loading ? <div className="p-12 text-center text-sm text-[#948477]">Gathering your invitations…</div> : items.length === 0 ? <div className="p-12 text-center"><Flower2 className="mx-auto text-gold"/><p className="serif mt-3 text-2xl text-burgundy">Your first story starts here</p><p className="mt-1 text-sm text-[#948477]">Create an invitation and make it yours.</p><Link href={`${base}/invitations/new`} className="mt-5 inline-flex rounded-full bg-burgundy px-5 py-3 text-sm text-white">Create an invitation</Link></div> : <div className="divide-y divide-[#f0e9df]">{items.map(item => <div key={item._id} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-[#fffdf9]"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7eddf] serif text-lg text-burgundy">{item.groom?.name?.[0]}<span className="text-gold">&</span>{item.bride?.name?.[0]}</div><div className="min-w-[150px] flex-1"><p className="serif text-xl text-burgundy">{item.groom?.name} & {item.bride?.name}</p><p className="mt-1 text-xs text-[#9a8a7b]">{item.weddingDetails?.date ? new Date(item.weddingDetails.date).toLocaleDateString() : 'Date not set'} · /invite/{item.slug}</p></div><span className={`rounded-full px-3 py-1 text-[11px] capitalize ${item.status === 'published' ? 'bg-[#edf5eb] text-[#52754c]' : 'bg-[#f6efe3] text-[#9b7738]'}`}>{item.status}</span><div className="flex items-center gap-1"><Link href={`${base}/invitations/${item._id}/edit`} title="Edit" className="rounded-lg p-2 text-[#84776b] hover:bg-[#f6efe3]"><MoreHorizontal size={18}/></Link><button onClick={() => duplicate(item._id)} title="Duplicate" className="rounded-lg p-2 text-[#84776b] hover:bg-[#f6efe3]"><Copy size={16}/></button>{item.status === 'published' && <Link target="_blank" href={`/invite/${item.slug}`} title="Open public invitation" className="rounded-lg p-2 text-[#84776b] hover:bg-[#f6efe3]"><ExternalLink size={16}/></Link>}<button onClick={() => remove(item._id)} title="Delete" className="rounded-lg p-2 text-[#aa7777] hover:bg-red-50"><Trash2 size={16}/></button></div></div>)}</div>}
        </section>
        <div className="mt-4 flex items-center justify-between text-xs text-[#a29385]"><span>{total} {total === 1 ? 'invitation' : 'invitations'} · Page {page} of {pages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-full border border-[#eadfce] px-3 py-2 disabled:opacity-40">Previous</button><button disabled={page >= pages} onClick={() => setPage(value => value + 1)} className="rounded-full border border-[#eadfce] px-3 py-2 disabled:opacity-40">Next</button></div></div>
      </div>
    </main>
  </div>;
}
