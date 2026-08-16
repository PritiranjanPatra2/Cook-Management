const Shift = require('../models/Shift');
const Settings = require('../models/Settings');
const { calculateMonthSummary, getDaysInMonth } = require('../utils/calculations');

// GET /api/reports/month
exports.getMonthReport = async (req, res, next) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year) || now.getUTCFullYear();
    const month = parseInt(req.query.month) || (now.getUTCMonth() + 1);

    const settings = await Settings.findOne();
    const trackingStartDate = settings ? settings.trackingStartDate : null;

    const monthPadded = String(month).padStart(2, '0');
    const startStr = `${year}-${monthPadded}-01`;
    const endStr = `${year}-${monthPadded}-31`;

    const shifts = await Shift.find({
      dateString: { $gte: startStr, $lte: endStr }
    }).populate('foods', 'name category active');

    const summary = calculateMonthSummary(year, month, shifts, trackingStartDate);

    return res.json({
      success: true,
      data: summary,
      shifts
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/day
exports.getDayReport = async (req, res, next) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];

    const shifts = await Shift.find({ dateString: dateStr })
      .populate('foods', 'name category active');

    const morningShift = shifts.find((s) => s.shift === 'morning') || null;
    const eveningShift = shifts.find((s) => s.shift === 'evening') || null;

    return res.json({
      success: true,
      date: dateStr,
      data: {
        morning: morningShift,
        evening: eveningShift
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/week
exports.getWeekReport = async (req, res, next) => {
  try {
    const { startDate } = req.query;
    let baseDate = startDate ? new Date(startDate) : new Date();

    // Determine Monday of the week
    const dayOfWeek = baseDate.getUTCDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(baseDate);
    monday.setUTCDate(baseDate.getUTCDate() + distanceToMonday);

    const days = [];
    const dateStrings = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);
      currentDay.setUTCDate(monday.getUTCDate() + i);
      const y = currentDay.getUTCFullYear();
      const m = String(currentDay.getUTCMonth() + 1).padStart(2, '0');
      const d = String(currentDay.getUTCDate()).padStart(2, '0');
      const dateString = `${y}-${m}-${d}`;
      dateStrings.push(dateString);
      days.push({
        dateString,
        dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        date: currentDay
      });
    }

    const shifts = await Shift.find({
      dateString: { $in: dateStrings }
    }).populate('foods', 'name category active');

    const weekData = days.map((day) => {
      const morning = shifts.find((s) => s.dateString === day.dateString && s.shift === 'morning') || null;
      const evening = shifts.find((s) => s.dateString === day.dateString && s.shift === 'evening') || null;

      return {
        ...day,
        morning,
        evening
      };
    });

    return res.json({
      success: true,
      startDate: dateStrings[0],
      endDate: dateStrings[6],
      data: weekData
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/food-analysis
exports.getFoodAnalysis = async (req, res, next) => {
  try {
    const { period = 'month', month, year, date, startDate, endDate } = req.query;
    const filter = {};

    if (period === 'day' && date) {
      filter.dateString = date;
    } else if (period === 'week' && startDate && endDate) {
      filter.dateString = { $gte: startDate, $lte: endDate };
    } else {
      // Default to month
      const now = new Date();
      const targetYear = parseInt(year) || now.getUTCFullYear();
      const targetMonth = parseInt(month) || (now.getUTCMonth() + 1);
      const monthPadded = String(targetMonth).padStart(2, '0');
      filter.dateString = {
        $gte: `${targetYear}-${monthPadded}-01`,
        $lte: `${targetYear}-${monthPadded}-31`
      };
    }

    const shifts = await Shift.find(filter).populate('foods', 'name category active');

    const foodMap = {};
    let totalMealsPrepared = 0;

    shifts.forEach((shift) => {
      if (['present', 'late'].includes(shift.status) || (shift.foods && shift.foods.length > 0)) {
        if (shift.foods && shift.foods.length > 0) {
          totalMealsPrepared++;
          shift.foods.forEach((food) => {
            const name = food.name || 'Unknown';
            if (!foodMap[name]) {
              foodMap[name] = {
                name,
                category: food.category || 'Other',
                count: 0,
                morningCount: 0,
                eveningCount: 0
              };
            }
            foodMap[name].count++;
            if (shift.shift === 'morning') foodMap[name].morningCount++;
            if (shift.shift === 'evening') foodMap[name].eveningCount++;
          });
        }
      }
    });

    const foodList = Object.values(foodMap).sort((a, b) => b.count - a.count);

    return res.json({
      success: true,
      period,
      totalMealsPrepared,
      data: foodList,
      mostPrepared: foodList[0] || null,
      secondMostPrepared: foodList[1] || null
    });
  } catch (error) {
    next(error);
  }
};
