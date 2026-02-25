import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string): string {
  try {
    return format(parseISO(date), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return date;
  }
}

export function formatDateTime(date: string): string {
  try {
    const d = new Date(date);
    return d.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date;
  }
}

export function formatMesAno(mesStr: string): string {
  try {
    const [year, month] = mesStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(date, 'MMM/yy', { locale: ptBR });
  } catch {
    return mesStr;
  }
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
