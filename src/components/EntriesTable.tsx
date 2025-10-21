import { formatDateForDisplay } from '@/lib/date';
import type { ActionResult, TravelEntry } from '@/types';

type EntriesTableProps = {
  entries: TravelEntry[];
  totalMiles: number;
  onDelete: (id: string) => Promise<ActionResult>;
  isMutating: boolean;
};

export const EntriesTable = ({ entries, totalMiles, onDelete, isMutating }: EntriesTableProps) => {
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this entry? This action cannot be undone.');
    if (!confirmed) return;
    const result = await onDelete(id);
    if (!result.success) {
      alert(result.message);
    }
  };

  if (!entries.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        No entries for this month yet. Add your first trip to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Trip Description
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Miles</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Business Purpose
            </th>
            <th className="px-4 py-3" aria-label="Actions" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="px-4 py-3 font-medium">{formatDateForDisplay(entry.entry_date)}</td>
              <td className="px-4 py-3">{entry.trip}</td>
              <td className="px-4 py-3 text-right">{Number(entry.miles).toFixed(1)}</td>
              <td className="px-4 py-3">{entry.purpose}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  className="rounded-md px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isMutating}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-slate-50">
          <tr>
            <td className="px-4 py-3 text-sm font-semibold text-slate-700" colSpan={2}>
              Monthly total
            </td>
            <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{totalMiles.toFixed(1)}</td>
            <td className="px-4 py-3" colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
