import { useMemo, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatMonthHuman } from '@/lib/date';
import { useTravelEntries } from '@/hooks/useTravelEntries';
import { EntryForm } from '@/components/EntryForm';
import { EntriesTable } from '@/components/EntriesTable';
import { MonthSelector } from '@/components/MonthSelector';
import type { ActionResult } from '@/types';

type DashboardProps = {
  supabase: SupabaseClient;
  session: Session;
  fullName: string;
  onSignOut: () => Promise<void>;
};

export const Dashboard = ({ supabase, session, fullName, onSignOut }: DashboardProps) => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [downloading, setDownloading] = useState(false);
  const {
    entries,
    loading,
    error,
    isMutating,
    totalMiles,
    addEntry,
    deleteEntry
  } = useTravelEntries(supabase, session.user.id, selectedMonth);

  const monthLabel = useMemo(() => formatMonthHuman(selectedMonth), [selectedMonth]);

  const handleDownload = async (): Promise<ActionResult> => {
    setDownloading(true);
    try {
      const response = await fetch('/mileage_template.xlsx');
      if (!response.ok) {
        throw new Error('Could not load the Excel template.');
      }

      const templateBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);

      const worksheet = workbook.getWorksheet('Sheet1') ?? workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('Template worksheet not found.');
      }

      worksheet.getCell('B1').value = fullName;

      const startRow = 4;
      const endRow = 32;
      const dataColumns = [1, 2, 3, 4] as const;
      const availableSlots = endRow - startRow + 1;

      for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
        const row = worksheet.getRow(rowNumber);
        dataColumns.forEach((columnIndex) => {
          const cell = row.getCell(columnIndex);
          cell.value = null;
        });
        row.commit();
      }

      if (entries.length > availableSlots) {
        throw new Error(
          `The Excel template currently supports ${availableSlots} rows (A4:D${endRow}). Please expand the template if you need to export additional entries.`
        );
      }

      entries.forEach((entry, index) => {
        const rowNumber = startRow + index;
        const row = worksheet.getRow(rowNumber);
        const entryDate = dayjs(entry.entry_date);

        row.getCell(1).value = entryDate.isValid() ? entryDate.toDate() : entry.entry_date;
        row.getCell(1).numFmt = 'mm/dd/yyyy';
        row.getCell(2).value = entry.trip;
        row.getCell(3).value = Number(entry.miles);
        row.getCell(3).numFmt = '0.0';
        row.getCell(4).value = entry.purpose;
        row.commit();
      });

      const fileName = buildFileName(fullName, selectedMonth);
      const outputBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([outputBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, fileName);

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Unable to generate the Excel file. Please try again.' };
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadClick = async () => {
    const result = await handleDownload();
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleAddEntry = (values: Parameters<typeof addEntry>[0]) => addEntry(values);
  const handleDeleteEntry = (id: string) => deleteEntry(id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Travel Logger</h1>
          <p className="text-sm text-slate-600">Welcome back, {fullName || session.user.email}.</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
          <div className="text-sm font-semibold text-slate-700">
            Total Miles: <span className="text-blue-600">{totalMiles.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadClick}
              disabled={downloading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {downloading ? 'Preparing...' : `Download ${monthLabel}`}
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <EntryForm onSubmit={handleAddEntry} isSubmitting={isMutating} selectedMonth={selectedMonth} />

      {loading ? (
        <div className="flex justify-center rounded-lg bg-white p-12 shadow-sm ring-1 ring-slate-200">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <EntriesTable entries={entries} totalMiles={totalMiles} onDelete={handleDeleteEntry} isMutating={isMutating} />
        </>
      )}
    </div>
  );
};

const buildFileName = (fullName: string, month: string) => {
  const parsed = dayjs(month, 'YYYY-MM', true);
  const monthPart = parsed.isValid() ? `${parsed.format('MM')}_${parsed.format('YYYY')}` : month.replace('-', '_');
  const trimmedName = fullName.trim();
  const nameParts = trimmedName ? trimmedName.split(/\s+/) : [];
  const first = nameParts[0] ?? 'Traveler';
  const last = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const normalized = [first, last].filter(Boolean).join('_').replace(/[^A-Za-z0-9_]/g, '') || 'Traveler';

  return `${normalized}_${monthPart} Mileage.xlsx`;
};
