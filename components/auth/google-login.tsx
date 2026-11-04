'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { LoaderCircle } from 'lucide-react';

export default function GoogleLogin({ audience }: { audience: 'admin' | 'customer' }) {
  const [busy, setBusy] = useState(false);
  const destination = audience === 'admin' ? '/admin' : '/customer';

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await signIn('google', { redirectTo: destination });
      }}
      className="flex w-full items-center justify-center gap-3 rounded-full bg-burgundy py-3.5 text-sm text-white shadow-luxe transition hover:bg-wine disabled:opacity-60"
    >
      {busy ? <LoaderCircle size={17} className="animate-spin" /> : <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-bold text-[#4285f4]">G</span>}
      Continue with Google
    </button>
  );
}
