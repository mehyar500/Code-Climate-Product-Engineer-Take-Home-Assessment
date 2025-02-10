import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(utc);

export const formatDate = (date: string | null): string => {
  if (!date) return '-';
  return dayjs(date).format('MMM D, YYYY');
};

export const formatRelativeTime = (date: string): string => {
  return dayjs(date).fromNow();
};

export const isOlderThanDays = (date: string, days: number): boolean => {
  const compareDate = dayjs().subtract(days, 'day');
  return dayjs(date).isBefore(compareDate);
};

export const getDateRangeForPeriod = (period: 'week' | 'month' | 'year'): { start: string; end: string } => {
  const end = dayjs().endOf('day').toISOString();
  const start = dayjs()
    .subtract(1, period)
    .startOf('day')
    .toISOString();

  return { start, end };
};

export const validateDateRange = (start: string | null, end: string | null): boolean => {
  if (!start || !end) return true;
  return dayjs(start).isBefore(dayjs(end));
}; 