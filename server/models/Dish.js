const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
      unique: true
    },
    category: {
      type: String,
      enum: ['Rice', 'Curry', 'Dal', 'Bread', 'Side', 'Dessert', 'Other'],
      default: 'Other'
    },
    active: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Dish', dishSchema);
