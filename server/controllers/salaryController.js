const Salary = require('../models/Salary');
const Shift = require('../models/Shift');
const Settings = require('../models/Settings');

// Helper to format date in readable format e.g. "17 Jul 2026"
function formatCycleDate(d) {
  const date = new Date(d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

// Helper to generate the 17-to-17 cycle for a given date
function getCycleForDate(targetDate = new Date()) {
  const d = new Date(targetDate);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth(); // 0-indexed
  const day = d.getUTCDate();

  let startYear = year;
  let startMonth = month;
  let endYear = year;
  let endMonth = month;

  if (day < 17) {
    // Current cycle started on 17th of previous month and ends on 17th of this month
    startMonth = month - 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear = year - 1;
    }
  } else {
    // Current cycle started on 17th of this month and ends on 17th of next month
    endMonth = month + 1;
    if (endMonth > 11) {
      endMonth = 0;
      endYear = year + 1;
    }
  }

  const cycleStartDate = new Date(Date.UTC(startYear, startMonth, 17, 0, 0, 0));
  const cycleEndDate = new Date(Date.UTC(endYear, endMonth, 17, 0, 0, 0));

  // The cycle key represents the due month (the end month)
  const monthPad = String(endMonth + 1).padStart(2, '0');
  const monthYearKey = `${endYear}-${monthPad}`;
  const cycleLabel = `${formatCycleDate(cycleStartDate)} – ${formatCycleDate(cycleEndDate)}`;

  return {
    cycleStartDate,
    cycleEndDate,
    cycleLabel,
    monthYearKey,
    isDue: day >= 17 // If today is 17th or after, the salary for the cycle ending on 17th is due
  };
}

// GET /api/salary/status
exports.getSalaryStatus = async (req, res, next) => {
  try {
    const now = new Date();
    const cycleInfo = getCycleForDate(now);

    // If today is >= 17, check the cycle ending today (or this month's 17th)
    // If today is < 17, the due cycle is the one ending on this month's 17th
    let dueMonth = now.getUTCMonth();
    let dueYear = now.getUTCFullYear();
    if (now.getUTCDate() >= 17) {
      // Cycle ending on 17th of this month is due for payment!
      dueMonth = now.getUTCMonth();
    } else {
      // Cycle ending on 17th of this month is upcoming
      dueMonth = now.getUTCMonth();
    }

    const pad = String(dueMonth + 1).padStart(2, '0');
    const targetKey = `${dueYear}-${pad}`;

    // Find or create record for this cycle
    let record = await Salary.findOne({ monthYearKey: targetKey });
    if (!record) {
      // Create default cycle
      const prevMonth = dueMonth === 0 ? 11 : dueMonth - 1;
      const prevYear = dueMonth === 0 ? dueYear - 1 : dueYear;
      const start = new Date(Date.UTC(prevYear, prevMonth, 17, 0, 0, 0));
      const end = new Date(Date.UTC(dueYear, dueMonth, 17, 0, 0, 0));

      record = await Salary.create({
        cycleStartDate: start,
        cycleEndDate: end,
        cycleLabel: `${formatCycleDate(start)} – ${formatCycleDate(end)}`,
        monthYearKey: targetKey,
        baseSalary: 5000,
        netPaidAmount: 5000,
        isPaid: false
      });
    }

    // Fetch shift attendance stats in this cycle
    const startStr = `${record.cycleStartDate.getUTCFullYear()}-${String(record.cycleStartDate.getUTCMonth() + 1).padStart(2, '0')}-17`;
    const endStr = `${record.cycleEndDate.getUTCFullYear()}-${String(record.cycleEndDate.getUTCMonth() + 1).padStart(2, '0')}-17`;

    const shifts = await Shift.find({
      dateString: { $gte: startStr, $lte: endStr }
    });

    const presentShifts = shifts.filter(s => ['present', 'late'].includes(s.status)).length;
    const leaveShifts = shifts.filter(s => s.status === 'leave').length;
    const totalRecordedShifts = shifts.length;

    // Check if salary is currently due (today's day >= 17 and not paid)
    const isDue = now.getUTCDate() >= 17;

    return res.json({
      success: true,
      data: {
        currentCycle: record,
        isDue,
        currentDay: now.getUTCDate(),
        stats: {
          presentShifts,
          leaveShifts,
          totalRecordedShifts
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/salary/history
exports.getSalaryHistory = async (req, res, next) => {
  try {
    const salaries = await Salary.find().sort({ cycleEndDate: -1 }).limit(12);
    return res.json({
      success: true,
      data: salaries
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/salary/toggle-paid
exports.toggleSalaryPaid = async (req, res, next) => {
  try {
    const { id, monthYearKey, isPaid, paymentMethod, netPaidAmount, notes } = req.body;

    let salary;
    if (id) {
      salary = await Salary.findById(id);
    } else if (monthYearKey) {
      salary = await Salary.findOne({ monthYearKey });
    }

    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary cycle record not found' });
    }

    salary.isPaid = isPaid !== undefined ? isPaid : !salary.isPaid;
    if (salary.isPaid) {
      salary.paidAt = new Date();
      if (paymentMethod) salary.paymentMethod = paymentMethod;
      if (netPaidAmount !== undefined) salary.netPaidAmount = Number(netPaidAmount);
      if (notes !== undefined) salary.notes = notes;
    } else {
      salary.paidAt = null;
    }

    await salary.save();

    return res.json({
      success: true,
      message: salary.isPaid ? 'Salary marked as Paid successfully' : 'Salary marked as Unpaid / Pending',
      data: salary
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/salary/:id
exports.updateSalaryRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { baseSalary, deductions, netPaidAmount, isPaid, paymentMethod, notes } = req.body;

    const salary = await Salary.findById(id);
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }

    if (baseSalary !== undefined) salary.baseSalary = Number(baseSalary);
    if (deductions !== undefined) salary.deductions = Number(deductions);
    if (netPaidAmount !== undefined) salary.netPaidAmount = Number(netPaidAmount);
    if (paymentMethod !== undefined) salary.paymentMethod = paymentMethod;
    if (notes !== undefined) salary.notes = notes;
    if (isPaid !== undefined) {
      salary.isPaid = isPaid;
      salary.paidAt = isPaid ? (salary.paidAt || new Date()) : null;
    }

    await salary.save();

    return res.json({
      success: true,
      message: 'Salary record updated successfully',
      data: salary
    });
  } catch (error) {
    next(error);
  }
};
