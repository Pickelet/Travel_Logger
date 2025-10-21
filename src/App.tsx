import { useEffect, useMemo, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase, supabaseInitError } from '@/lib/supabaseClient';
import { AuthForm } from '@/components/AuthForm';
import { Dashboard } from '@/components/Dashboard';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setInitializing(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      setInitializing(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, newSession) => {
      setSession(newSession);
      if (event === 'SIGNED_OUT') {
        setInitializing(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fullName = useMemo(() => {
    return session?.user?.user_metadata?.full_name ?? '';
  }, [session]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!supabase || supabaseInitError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold text-slate-900">Travel Logger</h1>
          <p className="mt-4 text-sm text-slate-700">
            {supabaseInitError ??
              'Supabase has not been configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment (see .env.example), then restart the dev server.'}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-100">
        <AuthForm supabase={supabase} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Dashboard supabase={supabase} session={session} fullName={fullName} onSignOut={handleSignOut} />
    </div>
  );
}
