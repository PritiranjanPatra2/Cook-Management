/**
 * Calculations and Date Helpers for Cook Routine Tracker
 */

/**
 * Returns number of calendar days in a month (1-indexed month: 1=Jan, 12=Dec)
 */
function getDaysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Calculates start day, total counted days, and expected shifts for a month
 */
function getTrackingPeriodInfo(year, month, trackingStartDate) {
  const totalMonthDays = getDaysInMonth(year, month);
  let startDay = 1;
  let endDay = totalMonthDays;
  let countedDays = totalMonthDays;

  if (trackingStartDate) {
    const tDate = new Date(trackingStartDate);
    const tYear = tDate.getUTCFullYear();
    const tMonth = tDate.getUTCMonth() + 1; // 1-indexed
    const tDay = tDate.getUTCDate();

    if (year < tYear || (year === tYear && month < tMonth)) {
      // Prior to tracking start
      return {
        totalMonthDays,
        startDay: 0,
        endDay: 0,
        countedDays: 0,
        expectedShifts: 0,
        isPriorToStart: true
      };
    } else if (year === tYear && month === tMonth) {
      // First tracking month
      startDay = tDay;
      countedDays = Math.max(0, totalMonthDays - startDay + 1);
    }
  }

  const expectedShifts = countedDays * 2;

  return {
    totalMonthDays,
    startDay,
    endDay,
    countedDays,
    expectedShifts,
    isPriorToStart: false
  };
}

/**
 * Calculates comprehensive monthly summary from a list of shifts
 */
function calculateMonthSummary(year, month, shifts = [], trackingStartDate) {
  const periodInfo = getTrackingPeriodInfo(year, month, trackingStartDate);
  const { totalMonthDays, startDay, endDay, countedDays, expectedShifts } = periodInfo;

  let presentCount = 0;
  let leaveCount = 0;
  let lateCount = 0;
  let otherCount = 0;

  const leaveReasons = {};
  const foodCounts = {};

  shifts.forEach((shift) => {
    switch (shift.status) {
      case 'present':
        presentCount++;
        break;
      case 'leave':
        leaveCount++;
        const reason = shift.reason && shift.reason.trim() ? shift.reason.trim() : 'Unspecified';
        leaveReasons[reason] = (leaveReasons[reason] || 0) + 1;
        break;
      case 'late':
        lateCount++;
        presentCount++; // Late is also physically present, but tracked separately as well
        break;
      case 'other':
        otherCount++;
        break;
      default:
        break;
    }

    // Tally foods if present or late or has foods recorded
    if (shift.foods && Array.isArray(shift.foods)) {
      shift.foods.forEach((food) => {
        const foodName = typeof food === 'object' && food.name ? food.name : String(food);
        foodCounts[foodName] = (foodCounts[foodName] || 0) + 1;
      });
    }
  });

  const totalRecorded = shifts.length;
  const notRecorded = Math.max(0, expectedShifts - (presentCount - lateCount + leaveCount + lateCount + otherCount));

  // Attendance Percentage = (Present Shifts / Expected Shifts) * 100
  const attendancePercentage =
    expectedShifts > 0 ? Number(((presentCount / expectedShifts) * 100).toFixed(2)) : 0;

  // Day Equivalents (1 shift = 0.5 day)
  const presentDayEquivalent = presentCount / 2;
  const leaveDayEquivalent = leaveCount / 2;
  const lateDayEquivalent = lateCount / 2;

  // Formatted Top Foods List
  const foodRanking = Object.entries(foodCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    year,
    month,
    totalMonthDays,
    startDay,
    endDay,
    countedDays,
    expectedShifts,
    presentCount,
    leaveCount,
    lateCount,
    otherCount,
    notRecorded,
    totalRecorded,
    attendancePercentage,
    presentDayEquivalent,
    leaveDayEquivalent,
    lateDayEquivalent,
    leaveReasons,
    foodRanking,
    mostPreparedFood: foodRanking[0] || null,
    secondMostPreparedFood: foodRanking[1] || null
  };
}

module.exports = {
  getDaysInMonth,
  getTrackingPeriodInfo,
  calculateMonthSummary
};
