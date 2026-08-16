const Shift = require('../models/Shift');

// Helper to format date to YYYY-MM-DD in UTC
function formatDateString(d) {
  const date = new Date(d);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// GET /api/shifts
exports.getShifts = async (req, res, next) => {
  try {
    const { date, startDate, endDate, month, year } = req.query;
    const filter = {};

    if (date) {
      // Exact date match
      const dateStr = typeof date === 'string' && date.length === 10 ? date : formatDateString(date);
      filter.dateString = dateStr;
    } else if (startDate && endDate) {
      // Date range match
      const startStr = typeof startDate === 'string' && startDate.length === 10 ? startDate : formatDateString(startDate);
      const endStr = typeof endDate === 'string' && endDate.length === 10 ? endDate : formatDateString(endDate);
      filter.dateString = { $gte: startStr, $lte: endStr };
    } else if (month && year) {
      // Month match (month is 1-indexed)
      const monthPadded = String(month).padStart(2, '0');
      const startStr = `${year}-${monthPadded}-01`;
      const endStr = `${year}-${monthPadded}-31`;
      filter.dateString = { $gte: startStr, $lte: endStr };
    }

    const shifts = await Shift.find(filter)
      .populate('foods', 'name category active')
      .sort({ dateString: -1, shift: -1 });

    return res.json({
      success: true,
      count: shifts.length,
      data: shifts
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/shifts/:id
exports.getShiftById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findById(id).populate('foods', 'name category active');

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    return res.json({
      success: true,
      data: shift
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/shifts (Create or update shift by date & shift type)
exports.createOrUpdateShift = async (req, res, next) => {
  try {
    const { date, shift, status, foods, reason, note } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    if (!shift || !['morning', 'evening'].includes(shift.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Valid shift (morning or evening) is required' });
    }

    const shiftType = shift.toLowerCase();
    const dateObj = new Date(date);
    const dateString = formatDateString(dateObj);

    // Business rule: Clear foods if status is not present or late, unless user specified
    let foodsList = Array.isArray(foods) ? foods : [];
    if (['leave', 'no_work'].includes(status) && (!foods || foods.length === 0)) {
      foodsList = [];
    }

    const updateData = {
      date: dateObj,
      dateString,
      shift: shiftType,
      status: status || 'present',
      foods: foodsList,
      reason: reason || '',
      note: note || ''
    };

    const savedShift = await Shift.findOneAndUpdate(
      { dateString, shift: shiftType },
      updateData,
      { new: true, upsert: true, runValidators: true }
    ).populate('foods', 'name category active');

    return res.status(200).json({
      success: true,
      message: 'Shift record saved successfully',
      data: savedShift
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/shifts/batch (Save both morning & evening shifts for a day at once)
exports.batchSaveDayShifts = async (req, res, next) => {
  try {
    const { date, morning, evening } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const dateObj = new Date(date);
    const dateString = formatDateString(dateObj);
    const results = {};

    if (morning) {
      const morningData = {
        date: dateObj,
        dateString,
        shift: 'morning',
        status: morning.status || 'present',
        foods: Array.isArray(morning.foods) ? morning.foods : [],
        reason: morning.reason || '',
        note: morning.note || ''
      };

      results.morning = await Shift.findOneAndUpdate(
        { dateString, shift: 'morning' },
        morningData,
        { new: true, upsert: true, runValidators: true }
      ).populate('foods', 'name category active');
    }

    if (evening) {
      const eveningData = {
        date: dateObj,
        dateString,
        shift: 'evening',
        status: evening.status || 'present',
        foods: Array.isArray(evening.foods) ? evening.foods : [],
        reason: evening.reason || '',
        note: evening.note || ''
      };

      results.evening = await Shift.findOneAndUpdate(
        { dateString, shift: 'evening' },
        eveningData,
        { new: true, upsert: true, runValidators: true }
      ).populate('foods', 'name category active');
    }

    return res.status(200).json({
      success: true,
      message: 'Day entries saved successfully',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/shifts/:id
exports.updateShiftById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, foods, reason, note } = req.body;

    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    if (status) shift.status = status;
    if (foods !== undefined) shift.foods = Array.isArray(foods) ? foods : [];
    if (reason !== undefined) shift.reason = reason;
    if (note !== undefined) shift.note = note;

    await shift.save();
    await shift.populate('foods', 'name category active');

    return res.json({
      success: true,
      message: 'Shift updated successfully',
      data: shift
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/shifts/:id
exports.deleteShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findByIdAndDelete(id);

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    return res.json({
      success: true,
      message: 'Shift record deleted successfully',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};
