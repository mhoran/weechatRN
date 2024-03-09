import { format } from 'date-fns';

export const formatDate = (date: string): string =>
  format(new Date(date), 'HH:mm');

export const formatDateDayChange = (date: string): string =>
  format(new Date(date), 'iii, dd LLL yyyy');
