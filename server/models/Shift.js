const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    dateString: {
      type: String,
      required: true,
      index: true
    },
    shift: {
      type: String,
      enum: ['morning', 'evening'],
      required: [true, 'Shift type is required']
    },
    status: {
      type: String,
      enum: ['present', 'leave', 'no_work', 'late', 'other'],
      default: 'present',
      required: true
    },
    foods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
      }
    ],
    foodDetails: [
      {
        dish: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Dish'
        },
        quantity: {
          type: String,
          default: '',
          trim: true
        }
      }
    ],
    reason: {
      type: String,
      default: '',
      trim: true
    },
    note: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to prevent duplicate shift entries for the same date and shift
shiftSchema.index({ dateString: 1, shift: 1 }, { unique: true });

// Normalize dateString before validation
shiftSchema.pre('validate', function (next) {
  if (this.date) {
    const d = new Date(this.date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    this.dateString = `${year}-${month}-${day}`;
  }
  next();
});

if (mongoose.models && mongoose.models.Shift) {
  delete mongoose.models.Shift;
}

module.exports = mongoose.model('Shift', shiftSchema);
