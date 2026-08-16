import { getDaysInMonth } from './dateUtils';

/**
 * Calculates metrics dynamically for client-side views
 */
export function calculateAttendanceMetrics(shifts = [], year, month, trackingStartDate) {
  const totalDaysInMonth = getDaysInMonth(year, month);
  let startDay = 1;
  let countedDays = totalDaysInMonth;

  if (trackingStartDate) {
    const tDate = new Date(trackingStartDate);
    const tYear = tDate.getFullYear();
    const tMonth = tDate.getMonth() + 1;
    const tDay = tDate.getDate();

    if (year < tYear || (year === tYear && month < tMonth)) {
      countedDays = 0;
      startDay = 0;
    } else if (year === tYear && month === tMonth) {
      startDay = tDay;
      countedDays = Math.max(0, totalDaysInMonth - startDay + 1);
    }
  }

  const expectedShifts = countedDays * 2;

  let present = 0;
  let leave = 0;
  let noWork = 0;
  let late = 0;
  let other = 0;

  shifts.forEach((s) => {
    if (s.status === 'present') present++;
    else if (s.status === 'leave') leave++;
    else if (s.status === 'no_work') noWork++;
    else if (s.status === 'late') {
      late++;
      present++;
    } else if (s.status === 'other') other++;
  });

  const totalRecorded = shifts.length;
  const notRecorded = Math.max(0, expectedShifts - (present - late + leave + noWork + late + other));
  const attendancePercentage = expectedShifts > 0 ? ((present / expectedShifts) * 100).toFixed(2) : 0;

  return {
    totalDays: totalDaysInMonth,
    startDay,
    countedDays,
    expectedShifts,
    present,
    leave,
    noWork,
    late,
    other,
    notRecorded,
    totalRecorded,
    attendancePercentage: parseFloat(attendancePercentage),
    presentDayEq: present / 2,
    leaveDayEq: leave / 2,
    noWorkDayEq: noWork / 2
  };
}
