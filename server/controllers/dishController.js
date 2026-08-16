const Dish = require('../models/Dish');
const Shift = require('../models/Shift');

// GET /api/dishes
exports.getDishes = async (req, res, next) => {
  try {
    const { activeOnly, search } = req.query;
    const filter = {};

    if (activeOnly === 'true') {
      filter.active = true;
    }

    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const dishes = await Dish.find(filter).sort({ name: 1 });

    return res.json({
      success: true,
      count: dishes.length,
      data: dishes
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/dishes
exports.createDish = async (req, res, next) => {
  try {
    const { name, category } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Dish name is required' });
    }

    const trimmedName = name.trim();

    // Check if dish exists (case-insensitive)
    let existingDish = await Dish.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });

    if (existingDish) {
      if (!existingDish.active) {
        existingDish.active = true;
        if (category) existingDish.category = category;
        await existingDish.save();
        return res.status(200).json({
          success: true,
          message: 'Dish re-activated successfully',
          data: existingDish
        });
      }
      return res.status(400).json({
        success: false,
        message: 'A dish with this name already exists'
      });
    }

    const dish = await Dish.create({
      name: trimmedName,
      category: category || 'Other',
      active: true
    });

    return res.status(201).json({
      success: true,
      message: 'Dish created successfully',
      data: dish
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/dishes/:id
exports.updateDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, active } = req.body;

    const dish = await Dish.findById(id);
    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    if (name && name.trim()) dish.name = name.trim();
    if (category) dish.category = category;
    if (typeof active === 'boolean') dish.active = active;

    await dish.save();

    return res.json({
      success: true,
      message: 'Dish updated successfully',
      data: dish
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/dishes/:id/toggle
exports.toggleDishActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dish = await Dish.findById(id);

    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    dish.active = !dish.active;
    await dish.save();

    return res.json({
      success: true,
      message: `Dish ${dish.active ? 'activated' : 'deactivated'} successfully`,
      data: dish
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/dishes/:id
exports.deleteDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dish = await Dish.findById(id);

    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    // Check if dish is referenced in any shifts
    const isReferenced = await Shift.exists({ foods: id });

    if (isReferenced) {
      // Soft delete by setting active to false to preserve historical shift food logs
      dish.active = false;
      await dish.save();

      return res.json({
        success: true,
        message: 'Dish is referenced in past shift logs and was deactivated (hidden from entry) to preserve history.',
        softDeleted: true,
        data: dish
      });
    }

    // Hard delete if never referenced
    await Dish.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Dish deleted permanently',
      softDeleted: false
    });
  } catch (error) {
    next(error);
  }
};
