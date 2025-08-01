export function formatWibDate(value: string): string {
  if (value) {
    const date = new Date(value);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } else {
    return '-';
  }
}