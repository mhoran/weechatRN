import { format } from 'date-fns';

export const formatDate = (date: string | number | Date): string =>
  format(date, 'ddd HH:mm:ss');
