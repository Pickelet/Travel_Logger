import dayjs from 'dayjs';
import type { MonthRange } from '@/types';

export const getMonthRange = (month: string): MonthRange => {
  const start = dayjs(month, 'YYYY-MM', true);
  if (!start.isValid()) {
    throw new Error(`Invalid month value: ${month}`);
  }

  return {
    start: start.startOf('month').format('YYYY-MM-DD'),
    end: start.endOf('month').format('YYYY-MM-DD')
  };
};

export const formatMonthHuman = (month: string): string => {
  const parsed = dayjs(month, 'YYYY-MM', true);
  return parsed.isValid() ? parsed.format('MMMM YYYY') : month;
};

export const formatDateForDisplay = (isoDate: string): string => {
  const parsed = dayjs(isoDate);
  return parsed.isValid() ? parsed.format('MM/DD/YYYY') : isoDate;
};
