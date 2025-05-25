import { format } from 'date-fns';

export function transformDateUTCHourToUserTime(value: string | Date): string {
  if (!value) return '';
  const date = new Date(value); 
  return format(date, 'dd/MM/yyyy HH:mm');
}

export function transformOnlyDate(value: string | Date): string {
  if (!value) return '';
  const date = new Date(value);
  return format(date, 'dd/MM/yyyy');
}