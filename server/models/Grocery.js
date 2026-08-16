const mongoose = require('mongoose');

const grocerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: String,
      default: '1 unit',
      trim: true
    },
    category: {
      type: String,
      enum: ['Grains & Flours', 'Dairy & Milk', 'Vegetables', 'Pulses & Dal', 'Oils & Spices', 'Other'],
      default: 'Other'
    },
    status: {
      type: String,
      enum: ['need_to_buy', 'in_stock'],
      default: 'need_to_buy'
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

if (mongoose.models && mongoose.models.Grocery) {
  delete mongoose.models.Grocery;
}

module.exports = mongoose.model('Grocery', grocerySchema);
