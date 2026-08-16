const Cylinder = require('../models/Cylinder');

// GET /api/cylinders/current
exports.getCurrentCylinder = async (req, res, next) => {
  try {
    const activeCylinder = await Cylinder.findOne({ status: 'active' }).sort({ connectedDate: -1 });
    const pastCylinders = await Cylinder.find({ status: 'finished' }).sort({ connectedDate: -1 });

    // Calculate historical average duration for 14.2kg cylinders (or normalized per kg)
    let totalDays = 0;
    let count = 0;
    pastCylinders.forEach(c => {
      if (c.durationDays && c.durationDays > 0) {
        totalDays += c.durationDays;
        count += 1;
      }
    });

    const averageLifespanDays = count > 0 ? Math.round(totalDays / count) : 42; // Default 42 days

    if (!activeCylinder) {
      return res.json({
        success: true,
        data: {
          activeCylinder: null,
          hasActive: false,
          averageLifespanDays,
          pastCylindersCount: pastCylinders.length
        }
      });
    }

    const now = new Date();
    const connected = new Date(activeCylinder.connectedDate);
    const diffTime = Math.max(0, now - connected);
    const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Scale expected lifespan if weight is different from 14.2kg
    const weight = activeCylinder.quantityKg || 14.2;
    const scaledLifespan = Math.max(5, Math.round((weight / 14.2) * averageLifespanDays));
    const daysRemaining = Math.max(0, scaledLifespan - daysElapsed);
    const percentRemaining = Math.max(0, Math.min(100, Math.round(((scaledLifespan - daysElapsed) / scaledLifespan) * 100)));
    const gasRemainingKg = ((percentRemaining / 100) * weight).toFixed(1);

    const predictedEmptyDate = new Date(connected.getTime() + scaledLifespan * 24 * 60 * 60 * 1000);
    const needsRefillAlert = daysRemaining <= 6 || percentRemaining <= 15;

    return res.json({
      success: true,
      data: {
        activeCylinder,
        hasActive: true,
        daysElapsed,
        estimatedLifespan: scaledLifespan,
        daysRemaining,
        percentRemaining,
        gasRemainingKg,
        predictedEmptyDate,
        needsRefillAlert,
        averageLifespanDays
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cylinders/history
exports.getCylinderHistory = async (req, res, next) => {
  try {
    const cylinders = await Cylinder.find().sort({ connectedDate: -1 }).limit(20);
    return res.json({
      success: true,
      data: cylinders
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cylinders/connect (Connect new cylinder or refilled today)
exports.connectNewCylinder = async (req, res, next) => {
  try {
    const { connectedDate, quantityKg, cost, agency, notes } = req.body;
    const now = connectedDate ? new Date(connectedDate) : new Date();

    // 1. If there is currently an active cylinder, auto-finish it
    const active = await Cylinder.findOne({ status: 'active' });
    if (active) {
      active.status = 'finished';
      active.finishedDate = now;
      const start = new Date(active.connectedDate);
      active.durationDays = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
      await active.save();
    }

    // 2. Create new active cylinder
    const newCylinder = await Cylinder.create({
      connectedDate: now,
      quantityKg: quantityKg ? Number(quantityKg) : 14.2,
      cost: cost ? Number(cost) : 0,
      agency: agency || 'Indane',
      status: 'active',
      notes: notes || ''
    });

    return res.status(201).json({
      success: true,
      message: 'New cylinder connected and tracking started successfully',
      data: newCylinder
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cylinders/:id
exports.updateCylinder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { connectedDate, finishedDate, quantityKg, cost, agency, notes, status, durationDays } = req.body;

    const cylinder = await Cylinder.findById(id);
    if (!cylinder) {
      return res.status(404).json({ success: false, message: 'Cylinder record not found' });
    }

    if (connectedDate) cylinder.connectedDate = new Date(connectedDate);
    if (finishedDate !== undefined) cylinder.finishedDate = finishedDate ? new Date(finishedDate) : null;
    if (quantityKg !== undefined) cylinder.quantityKg = Number(quantityKg);
    if (cost !== undefined) cylinder.cost = Number(cost);
    if (agency !== undefined) cylinder.agency = agency;
    if (notes !== undefined) cylinder.notes = notes;
    if (status !== undefined) cylinder.status = status;
    if (durationDays !== undefined) cylinder.durationDays = Number(durationDays);

    // If both dates exist and duration not manually provided, recalculate
    if (cylinder.connectedDate && cylinder.finishedDate && !durationDays) {
      cylinder.durationDays = Math.max(1, Math.floor((cylinder.finishedDate - cylinder.connectedDate) / (1000 * 60 * 60 * 24)));
    }

    await cylinder.save();

    return res.json({
      success: true,
      message: 'Cylinder record updated successfully',
      data: cylinder
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cylinders/:id
exports.deleteCylinder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cylinder = await Cylinder.findByIdAndDelete(id);
    if (!cylinder) {
      return res.status(404).json({ success: false, message: 'Cylinder record not found' });
    }

    return res.json({
      success: true,
      message: 'Cylinder record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
