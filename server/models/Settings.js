const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    passcodeHash: {
      type: String,
      required: true
    },
    trackingStartDate: {
      type: Date,
      default: () => new Date('2026-08-16T00:00:00.000Z')
    },
    cookName: {
      type: String,
      default: 'Cook'
    },
    shiftsPerDay: {
      type: Number,
      default: 2
    },
    morningShiftName: {
      type: String,
      default: 'Morning'
    },
    eveningShiftName: {
      type: String,
      default: 'Evening'
    },
    customReasons: {
      type: [String],
      default: [
        'Personal',
        'Sick',
        'Emergency',
        'Festival / Holiday',
        'No Floor / No Work',
        'Did Not Inform',
        'Other'
      ]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
