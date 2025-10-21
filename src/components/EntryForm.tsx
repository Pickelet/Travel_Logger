import { useEffect, useState } from 'react';
import type { ZodIssue } from 'zod';
import dayjs from 'dayjs';
import { entryFormSchema } from '@/lib/validation';
import { PRESET_TRIPS } from '@/constants/trips';
import type { ActionResult, TravelEntryInput } from '@/types';

type EntryFormState = {
  entryDate: string;
  trip: string;
  miles: string;
  purpose: string;
};

type EntryFormProps = {
  onSubmit: (values: TravelEntryInput) => Promise<ActionResult>;
  isSubmitting: boolean;
  selectedMonth: string;
};

export const EntryForm = ({ onSubmit, isSubmitting, selectedMonth }: EntryFormProps) => {
  const [formState, setFormState] = useState<EntryFormState>({
    entryDate: dayjs().format('YYYY-MM-DD'),
    trip: '',
    miles: '',
    purpose: ''
  });
  const [fieldErrors, setFieldErrors] = useState<Record<keyof EntryFormState, string | null>>({
    entryDate: null,
    trip: null,
    miles: null,
    purpose: null
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [presetTrip, setPresetTrip] = useState<string>('');
  const [distanceOption, setDistanceOption] = useState<'oneWay' | 'round'>('round');

  useEffect(() => {
    const month = dayjs(selectedMonth, 'YYYY-MM', true);
    if (!month.isValid()) {
      return;
    }
    setFormState((prev) => {
      const currentMonth = dayjs(prev.entryDate).format('YYYY-MM');
      if (currentMonth === selectedMonth) {
        return prev;
      }
      return { ...prev, entryDate: month.startOf('month').format('YYYY-MM-DD') };
    });
  }, [selectedMonth]);

  const resetForm = () => {
    setFormState((prev) => ({
      ...prev,
      trip: '',
      miles: '',
      purpose: ''
    }));
    setPresetTrip('');
    setDistanceOption('round');
  };

  const handleChange = (field: keyof EntryFormState) => (value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
    setStatusMessage(null);
    if (field === 'trip' || field === 'miles') {
      setPresetTrip('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    const result = entryFormSchema.safeParse(formState);

    if (!result.success) {
      const nextErrors: Record<keyof EntryFormState, string | null> = {
        entryDate: null,
        trip: null,
        miles: null,
        purpose: null
      };

      result.error.issues.forEach((issue: ZodIssue) => {
        const pathKey = issue.path[0];
        if (typeof pathKey === 'string' && pathKey in nextErrors) {
          nextErrors[pathKey as keyof EntryFormState] = issue.message;
        }
      });

      setFieldErrors(nextErrors);
      return;
    }

    const response = await onSubmit(result.data);
    if (response.success) {
      resetForm();
    } else {
      setStatusMessage(response.message);
    }
  };

  const applyPreset = (tripName: string, option: 'oneWay' | 'round') => {
    const preset = PRESET_TRIPS[tripName as keyof typeof PRESET_TRIPS];
    if (!preset) return;

    setFormState((prev) => ({
      ...prev,
      trip: tripName,
      miles: preset[option].toString()
    }));
  };

  const handlePresetSelect = (value: string) => {
    setPresetTrip(value);
    if (value) {
      applyPreset(value, distanceOption);
    }
  };

  const handleDistanceChange = (value: 'oneWay' | 'round') => {
    setDistanceOption(value);
    if (presetTrip) {
      applyPreset(presetTrip, value);
    }
  };

  const presetOptions = Object.keys(PRESET_TRIPS);

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Date
          <input
            type="date"
            value={formState.entryDate}
            onChange={(event) => handleChange('entryDate')(event.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {fieldErrors.entryDate ? <span className="text-xs text-red-600">{fieldErrors.entryDate}</span> : null}
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Trip Description
          <input
            type="text"
            value={formState.trip}
            onChange={(event) => handleChange('trip')(event.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Client visit"
          />
          {fieldErrors.trip ? <span className="text-xs text-red-600">{fieldErrors.trip}</span> : null}
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Miles
          <input
            type="number"
            step="0.1"
            min="0"
            value={formState.miles}
            onChange={(event) => handleChange('miles')(event.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.0"
          />
          {fieldErrors.miles ? <span className="text-xs text-red-600">{fieldErrors.miles}</span> : null}
        </label>

        <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Preset Trip (optional)
            <select
              value={presetTrip}
              onChange={(event) => handlePresetSelect(event.target.value)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Custom route</option>
              {presetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="radio"
                name="distanceOption"
                value="round"
                checked={distanceOption === 'round'}
                onChange={() => handleDistanceChange('round')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              Round trip
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="radio"
                name="distanceOption"
                value="oneWay"
                checked={distanceOption === 'oneWay'}
                onChange={() => handleDistanceChange('oneWay')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              One way
            </label>
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 lg:col-span-1 md:col-span-2">
          Business Purpose
          <input
            type="text"
            value={formState.purpose}
            onChange={(event) => handleChange('purpose')(event.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Project kickoff"
          />
          {fieldErrors.purpose ? <span className="text-xs text-red-600">{fieldErrors.purpose}</span> : null}
        </label>
      </div>

      {statusMessage ? <p className="mt-3 text-sm text-red-600">{statusMessage}</p> : null}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : 'Add Entry'}
        </button>
      </div>
    </form>
  );
};
