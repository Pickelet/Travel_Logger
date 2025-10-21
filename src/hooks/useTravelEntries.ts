import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getMonthRange } from '@/lib/date';
import type { ActionResult, TravelEntry, TravelEntryInput } from '@/types';

export const useTravelEntries = (
  supabase: SupabaseClient | null,
  userId: string | undefined,
  month: string
) => {
  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!supabase) {
      setEntries([]);
      setError('Supabase client not configured.');
      setLoading(false);
      return;
    }

    if (!userId) {
      setEntries([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const range = getMonthRange(month);
      const { data, error: queryError } = await supabase
        .from('travel_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('entry_date', range.start)
        .lte('entry_date', range.end)
        .order('entry_date', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      setEntries(data ?? []);
    } catch (err) {
      console.error(err);
      setError('Unable to load entries for this month.');
    } finally {
      setLoading(false);
    }
  }, [supabase, userId, month]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(
    async (input: TravelEntryInput): Promise<ActionResult> => {
      if (!supabase) {
        return { success: false, message: 'Supabase client not configured.' };
      }

      if (!userId) {
        return { success: false, message: 'Missing user information.' };
      }

      setIsMutating(true);
      try {
        const { data, error: insertError } = await supabase
          .from('travel_entries')
          .insert({
            user_id: userId,
            entry_date: input.entryDate,
            trip: input.trip,
            miles: input.miles,
            purpose: input.purpose
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        if (data) {
          setEntries((prev) =>
            [...prev, data].sort((a, b) =>
              a.entry_date.localeCompare(b.entry_date)
            )
          );
        }

        return { success: true };
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Could not save the entry. Please try again.' };
      } finally {
        setIsMutating(false);
      }
    },
    [supabase, userId]
  );

  const deleteEntry = useCallback(
    async (id: string): Promise<ActionResult> => {
      if (!supabase) {
        return { success: false, message: 'Supabase client not configured.' };
      }

      setIsMutating(true);
      try {
        const { error: deleteError } = await supabase
          .from('travel_entries')
          .delete()
          .eq('id', id);

        if (deleteError) {
          throw deleteError;
        }

        setEntries((prev) => prev.filter((entry) => entry.id !== id));
        return { success: true };
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Could not delete the entry.' };
      } finally {
        setIsMutating(false);
      }
    },
    [supabase]
  );

  const totalMiles = useMemo(
    () => entries.reduce((sum, entry) => sum + Number(entry.miles ?? 0), 0),
    [entries]
  );

  return {
    entries,
    loading,
    error,
    isMutating,
    totalMiles,
    refresh: fetchEntries,
    addEntry,
    deleteEntry
  };
};
