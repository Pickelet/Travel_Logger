import { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

type AuthMode = 'sign-in' | 'sign-up';

const initialState = { email: '', password: '', fullName: '' };

type AuthFormProps = {
  supabase: SupabaseClient;
};

export const AuthForm = ({ supabase }: AuthFormProps) => {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [formState, setFormState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const toggleMode = () => {
    setMode((prev) => (prev === 'sign-in' ? 'sign-up' : 'sign-in'));
    setFormState(initialState);
    setError(null);
    setInfo(null);
  };

  const handleChange = (field: keyof typeof initialState) => (value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === 'sign-in') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password
        });

        if (signInError) {
          throw signInError;
        }
      } else {
        if (!formState.fullName.trim()) {
          throw new Error('Please provide your full name to create an account.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formState.email,
          password: formState.password,
          options: {
            data: {
              full_name: formState.fullName.trim()
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (!data.session) {
          setInfo('Check your email to confirm the sign-up before you can sign in.');
        }
      }
    } catch (err) {
      if (err instanceof TypeError || (err instanceof Error && err.message.toLowerCase().includes('fetch'))) {
        setError(
          'Unable to reach Supabase. Confirm your internet connection and ensure VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are correct.'
        );
      } else {
        const message =
          err instanceof Error ? err.message : 'Authentication failed. Please try again.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
      <h1 className="text-center text-2xl font-semibold text-slate-900">
        Travel Logger
      </h1>
      <p className="mt-2 text-center text-sm text-slate-600">
        {mode === 'sign-in'
          ? 'Sign in to manage your travel mileage.'
          : 'Create an account to start tracking your mileage.'}
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            autoComplete="email"
            value={formState.email}
            onChange={(event) => handleChange('email')(event.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            value={formState.password}
            onChange={(event) => handleChange('password')(event.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </label>

        {mode === 'sign-up' ? (
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Full Name
            <input
              type="text"
              autoComplete="name"
              value={formState.fullName}
              onChange={(event) => handleChange('fullName')(event.target.value)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={mode === 'sign-up'}
            />
          </label>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {info ? <p className="text-sm text-blue-600">{info}</p> : null}

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Please wait...' : mode === 'sign-in' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {mode === 'sign-in' ? (
          <>
            Need an account?{' '}
            <button
              type="button"
              className="font-semibold text-blue-600 hover:underline"
              onClick={toggleMode}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already registered?{' '}
            <button
              type="button"
              className="font-semibold text-blue-600 hover:underline"
              onClick={toggleMode}
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
};
