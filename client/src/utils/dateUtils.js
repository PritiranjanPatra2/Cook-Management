import { MONTH_NAMES } from './constants';

export function toYYYYMMDD(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatDateShort(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()]?.substring(0, 3);
  return `${day} ${month}`;
}

export function getDaysInMonth(year, month) {
  // month is 1-indexed (1=Jan, 12=Dec)
  return new Date(year, month, 0).getDate();
}

export function getMonthName(month) {
  // month is 1-indexed
  return MONTH_NAMES[month - 1] || '';
}

/**
 * Returns array of days for week starting on Monday
 */
export function getWeekDays(baseDate = new Date()) {
  const d = new Date(baseDate);
  const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(d);
  monday.setDate(d.getDate() + distanceToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    days.push({
      date: current,
      dateString: toYYYYMMDD(current),
      dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]
    });
  }
  return days;
}

/**
 * Generates month grid for calendar (including leading/trailing blank days)
 */
export function getCalendarGrid(year, month) {
  const totalDays = getDaysInMonth(year, month);
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sun
  // Convert so Monday is 0, Sunday is 6
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const days = [];

  // Pad previous month days
  for (let i = 0; i < startOffset; i++) {
    days.push({ isCurrentMonth: false, dayNumber: null, dateString: null });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const monthPadded = String(month).padStart(2, '0');
    const dayPadded = String(d).padStart(2, '0');
    const dateString = `${year}-${monthPadded}-${dayPadded}`;
    days.push({
      isCurrentMonth: true,
      dayNumber: d,
      dateString,
      date: new Date(year, month - 1, d)
    });
  }

  return days;
}
