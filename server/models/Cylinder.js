const mongoose = require('mongoose');

const cylinderSchema = new mongoose.Schema(
  {
    connectedDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    finishedDate: {
      type: Date,
      default: null
    },
    quantityKg: {
      type: Number,
      default: 14.2
    },
    cost: {
      type: Number,
      default: 0
    },
    agency: {
      type: String,
      default: 'Indane',
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'finished'],
      default: 'active'
    },
    durationDays: {
      type: Number,
      default: null
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

if (mongoose.models && mongoose.models.Cylinder) {
  delete mongoose.models.Cylinder;
}

module.exports = mongoose.model('Cylinder', cylinderSchema);
