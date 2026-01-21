export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', isoString);
    return '';
  }
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export function compareDates(dateStr1: string, dateStr2: string): boolean{
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  if (d1 >= d2) return true;
  return false;
}