import dayjs from 'dayjs';
import { z } from 'zod';
import type { TravelEntryInput } from '@/types';

const milesRegex = /^\d+(\.\d)?$/;

export const entryFormSchema = z
  .object({
    entryDate: z
      .string()
      .refine(
        (value) => dayjs(value, 'YYYY-MM-DD', true).isValid(),
        { message: 'Please provide a valid date.' }
      ),
    trip: z.string().trim().min(1, 'Trip description is required.'),
    miles: z
      .string()
      .trim()
      .refine((value) => value !== '', { message: 'Miles are required.' })
      .refine((value) => milesRegex.test(value), {
        message: 'Miles must be a non-negative number with at most one decimal.'
      })
      .transform((value) => parseFloat(value)),
    purpose: z.string().trim().min(1, 'Business purpose is required.')
  })
  .transform(
    (data): TravelEntryInput => ({
      entryDate: data.entryDate,
      trip: data.trip.trim(),
      miles: data.miles,
      purpose: data.purpose.trim()
    })
  );

export type EntryFormSchema = z.infer<typeof entryFormSchema>;
