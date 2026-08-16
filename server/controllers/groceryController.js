const Grocery = require('../models/Grocery');
const Dish = require('../models/Dish');

const DEFAULT_ESSENTIALS = [
  { name: 'Atta (Wheat Flour)', quantity: '5 kg', category: 'Grains & Flours', status: 'in_stock' },
  { name: 'Basmati / Steamed Rice', quantity: '5 kg', category: 'Grains & Flours', status: 'in_stock' },
  { name: 'Toor / Moong Dal', quantity: '1 kg', category: 'Pulses & Dal', status: 'in_stock' },
  { name: 'Cooking Oil (Mustard/Sunflower)', quantity: '1 Litre', category: 'Oils & Spices', status: 'in_stock' },
  { name: 'Fresh Paneer', quantity: '500 g', category: 'Dairy & Milk', status: 'need_to_buy' },
  { name: 'Potatoes (Aloo)', quantity: '2 kg', category: 'Vegetables', status: 'in_stock' },
  { name: 'Onions (Pyaz)', quantity: '2 kg', category: 'Vegetables', status: 'in_stock' },
  { name: 'Tomatoes', quantity: '1 kg', category: 'Vegetables', status: 'in_stock' },
  { name: 'Green Chillies & Ginger', quantity: '250 g', category: 'Vegetables', status: 'in_stock' },
  { name: 'Salt, Turmeric & Masala', quantity: '1 pack', category: 'Oils & Spices', status: 'in_stock' }
];

// GET /api/groceries
exports.getGroceries = async (req, res, next) => {
  try {
    let items = await Grocery.find().sort({ category: 1, name: 1 });

    // Seed defaults if brand new
    if (items.length === 0) {
      await Grocery.insertMany(DEFAULT_ESSENTIALS);
      items = await Grocery.find().sort({ category: 1, name: 1 });
    }

    const needToBuyCount = items.filter(i => i.status === 'need_to_buy').length;
    const inStockCount = items.filter(i => i.status === 'in_stock').length;

    return res.json({
      success: true,
      data: {
        items,
        needToBuyCount,
        inStockCount,
        totalItems: items.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/groceries
exports.createGrocery = async (req, res, next) => {
  try {
    const { name, quantity, category, status, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    const item = await Grocery.create({
      name: name.trim(),
      quantity: quantity ? quantity.trim() : '1 unit',
      category: category || 'Other',
      status: status || 'need_to_buy',
      notes: notes || ''
    });

    return res.status(201).json({
      success: true,
      message: `"${item.name}" added to groceries`,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/groceries/:id
exports.updateGrocery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, quantity, category, status, notes } = req.body;

    const item = await Grocery.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Grocery item not found' });
    }

    if (name) item.name = name.trim();
    if (quantity !== undefined) item.quantity = quantity.trim();
    if (category) item.category = category;
    if (status) item.status = status;
    if (notes !== undefined) item.notes = notes;

    await item.save();

    return res.json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/groceries/:id/toggle
exports.toggleGroceryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Grocery.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Grocery item not found' });
    }

    item.status = item.status === 'need_to_buy' ? 'in_stock' : 'need_to_buy';
    await item.save();

    return res.json({
      success: true,
      message: item.status === 'in_stock' ? `Marked "${item.name}" as In Stock ✅` : `Marked "${item.name}" to Buy 🛒`,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/groceries/:id
exports.deleteGrocery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Grocery.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Grocery item not found' });
    }

    return res.json({
      success: true,
      message: `"${item.name}" removed from grocery list`
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/groceries/what-can-we-make (Smart Recipe / Dish Matcher from In-Stock Ingredients)
exports.whatCanWeMake = async (req, res, next) => {
  try {
    const inStockItems = await Grocery.find({ status: 'in_stock' }).lean();
    const dishes = await Dish.find({ active: true }).lean();

    const inStockNames = inStockItems.map(i => i.name.toLowerCase()).join(' ');

    const results = dishes.map(dish => {
      const dName = dish.name.toLowerCase();
      const cat = (dish.category || '').toLowerCase();

      // Ingredient requirements keywords mapping
      let requiredKeywords = [];
      if (/roti|chapati|paratha/i.test(dName)) requiredKeywords.push('atta', 'flour');
      if (/rice|pulao|biryani|khichdi|bhat/i.test(dName)) requiredKeywords.push('rice');
      if (/paneer/i.test(dName)) requiredKeywords.push('paneer');
      if (/dal|tadka|sambar/i.test(dName)) requiredKeywords.push('dal');
      if (/aloo|potato/i.test(dName)) requiredKeywords.push('aloo', 'potato');
      if (/egg/i.test(dName)) requiredKeywords.push('egg');
      if (/chicken/i.test(dName)) requiredKeywords.push('chicken');
      if (/bhindi|okra/i.test(dName)) requiredKeywords.push('bhindi', 'okra');
      if (/soya/i.test(dName)) requiredKeywords.push('soya');
      if (/chole|chana/i.test(dName)) requiredKeywords.push('chole', 'chana');
      if (/rajma/i.test(dName)) requiredKeywords.push('rajma');
      if (/gobi|cauliflower/i.test(dName)) requiredKeywords.push('gobi', 'cauliflower');

      if (requiredKeywords.length === 0) {
        // General match
        requiredKeywords = [dName.split(' ')[0]];
      }

      // Check how many required keywords exist in stock
      const matched = requiredKeywords.filter(kw => inStockNames.includes(kw));
      const canMake = matched.length > 0;
      const matchScore = matched.length / requiredKeywords.length;

      return {
        dish,
        canMake,
        matchScore,
        matchedIngredients: matched,
        keyIngredient: requiredKeywords[0] || 'Essentials'
      };
    });

    const readyToMake = results.filter(r => r.canMake).sort((a, b) => b.matchScore - a.matchScore);
    const needIngredients = results.filter(r => !r.canMake);

    return res.json({
      success: true,
      data: {
        inStockItemsCount: inStockItems.length,
        readyToMake,
        needIngredients,
        summary: `You can cook ${readyToMake.length} dishes right now with your available pantry ingredients!`
      }
    });
  } catch (error) {
    next(error);
  }
};
