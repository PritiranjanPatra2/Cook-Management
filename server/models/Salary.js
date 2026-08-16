const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema(
  {
    cycleStartDate: {
      type: Date,
      required: true
    },
    cycleEndDate: {
      type: Date,
      required: true
    },
    cycleLabel: {
      type: String,
      required: true
    },
    monthYearKey: {
      type: String, // e.g. "2026-08" for easy lookup
      required: true,
      unique: true
    },
    baseSalary: {
      type: Number,
      default: 5000
    },
    deductions: {
      type: Number,
      default: 0
    },
    netPaidAmount: {
      type: Number,
      default: 5000
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Date,
      default: null
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Cash', 'Bank Transfer', 'Other'],
      default: 'UPI'
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

if (mongoose.models && mongoose.models.Salary) {
  delete mongoose.models.Salary;
}

module.exports = mongoose.model('Salary', salarySchema);
