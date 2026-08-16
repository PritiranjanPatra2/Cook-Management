const bcrypt = require('bcryptjs');
const Settings = require('../models/Settings');

/**
 * Ensure default settings exist in DB
 */
async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    const salt = await bcrypt.genSalt(10);
    const passcodeHash = await bcrypt.hash('7894', salt);
    settings = await Settings.create({
      passcodeHash,
      trackingStartDate: new Date('2026-08-16T00:00:00.000Z'),
      cookName: 'Cook',
      shiftsPerDay: 2,
      morningShiftName: 'Morning',
      eveningShiftName: 'Evening',
      customReasons: [
        'Personal',
        'Sick',
        'Emergency',
        'Festival / Holiday',
        'No Floor / No Work',
        'Did Not Inform',
        'Other'
      ]
    });
  }
  return settings;
}

// POST /api/settings/verify-passcode
exports.verifyPasscode = async (req, res, next) => {
  try {
    const { passcode } = req.body;
    if (!passcode) {
      return res.status(400).json({ success: false, message: 'Passcode is required' });
    }

    const settings = await getOrCreateSettings();
    const isMatch = await bcrypt.compare(String(passcode), settings.passcodeHash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid passcode' });
    }

    return res.json({
      success: true,
      message: 'Passcode verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/settings/change-passcode
exports.changePasscode = async (req, res, next) => {
  try {
    const { currentPasscode, newPasscode } = req.body;

    if (!currentPasscode || !newPasscode) {
      return res.status(400).json({
        success: false,
        message: 'Both current passcode and new passcode are required'
      });
    }

    if (String(newPasscode).length < 4) {
      return res.status(400).json({
        success: false,
        message: 'New passcode must be at least 4 digits'
      });
    }

    const settings = await getOrCreateSettings();
    const isMatch = await bcrypt.compare(String(currentPasscode), settings.passcodeHash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current passcode is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    settings.passcodeHash = await bcrypt.hash(String(newPasscode), salt);
    await settings.save();

    return res.json({
      success: true,
      message: 'Passcode changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    return res.json({
      success: true,
      data: {
        _id: settings._id,
        trackingStartDate: settings.trackingStartDate,
        cookName: settings.cookName,
        shiftsPerDay: settings.shiftsPerDay,
        morningShiftName: settings.morningShiftName,
        eveningShiftName: settings.eveningShiftName,
        customReasons: settings.customReasons,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const { trackingStartDate, cookName, morningShiftName, eveningShiftName, customReasons } = req.body;
    const settings = await getOrCreateSettings();

    if (trackingStartDate) settings.trackingStartDate = new Date(trackingStartDate);
    if (cookName !== undefined) settings.cookName = cookName;
    if (morningShiftName !== undefined) settings.morningShiftName = morningShiftName;
    if (eveningShiftName !== undefined) settings.eveningShiftName = eveningShiftName;
    if (customReasons !== undefined && Array.isArray(customReasons)) {
      settings.customReasons = customReasons;
    }

    await settings.save();

    return res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        _id: settings._id,
        trackingStartDate: settings.trackingStartDate,
        cookName: settings.cookName,
        shiftsPerDay: settings.shiftsPerDay,
        morningShiftName: settings.morningShiftName,
        eveningShiftName: settings.eveningShiftName,
        customReasons: settings.customReasons
      }
    });
  } catch (error) {
    next(error);
  }
};
