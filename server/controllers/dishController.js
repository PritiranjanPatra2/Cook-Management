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

    const dishes = await Dish.find(filter).sort({ name: 1 }).lean();

    // Fetch shift usage for each dish to compute last cooked info
    const dishIds = dishes.map(d => d._id);
    const shiftsWithDishes = await Shift.find({
      foods: { $in: dishIds }
    }).select('foods dateString date').sort({ dateString: -1 }).lean();

    const today = new Date();
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

    const dishStatsMap = {};
    for (const shift of shiftsWithDishes) {
      const shiftDate = new Date(shift.dateString || shift.date);
      const shiftUTC = Date.UTC(shiftDate.getUTCFullYear(), shiftDate.getUTCMonth(), shiftDate.getUTCDate());
      const daysAgo = Math.max(0, Math.floor((todayUTC - shiftUTC) / (1000 * 60 * 60 * 24)));

      for (const foodId of shift.foods || []) {
        const idStr = String(foodId);
        if (!dishStatsMap[idStr]) {
          dishStatsMap[idStr] = {
            lastCookedDate: shift.dateString,
            lastCookedDaysAgo: daysAgo,
            totalTimesCooked: 1
          };
        } else {
          dishStatsMap[idStr].totalTimesCooked += 1;
        }
      }
    }

    const enrichedDishes = dishes.map(dish => {
      const stats = dishStatsMap[String(dish._id)] || {
        lastCookedDate: null,
        lastCookedDaysAgo: null,
        totalTimesCooked: 0
      };
      return {
        ...dish,
        ...stats
      };
    });

    return res.json({
      success: true,
      count: enrichedDishes.length,
      data: enrichedDishes
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dishes/suggest-combo (Smart 🎲 Surprise Combo Generator)
exports.suggestMealCombo = async (req, res, next) => {
  try {
    const { shift = 'morning' } = req.query;
    const dishes = await Dish.find({ active: true }).lean();

    if (!dishes || dishes.length === 0) {
      return res.status(404).json({ success: false, message: 'No active dishes found to generate combo' });
    }

    // Fetch shift usage to know when each dish was last made
    const dishIds = dishes.map(d => d._id);
    const shifts = await Shift.find({ foods: { $in: dishIds } })
      .select('foods dateString date')
      .sort({ dateString: -1 })
      .lean();

    const today = new Date();
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const dishStatsMap = {};

    for (const s of shifts) {
      const sDate = new Date(s.dateString || s.date);
      const sUTC = Date.UTC(sDate.getUTCFullYear(), sDate.getUTCMonth(), sDate.getUTCDate());
      const daysAgo = Math.max(0, Math.floor((todayUTC - sUTC) / (1000 * 60 * 60 * 24)));

      for (const foodId of s.foods || []) {
        const idStr = String(foodId);
        if (!dishStatsMap[idStr]) {
          dishStatsMap[idStr] = { daysAgo, lastCookedDate: s.dateString };
        }
      }
    }

    const categorized = {
      staple: [],
      gravy: [],
      side: []
    };

    dishes.forEach(dish => {
      const stats = dishStatsMap[String(dish._id)] || { daysAgo: 999, lastCookedDate: null };
      const d = { ...dish, ...stats };

      const nameLower = dish.name.toLowerCase();
      const catLower = (dish.category || '').toLowerCase();

      // Check category or keywords
      if (/roti|rice|paratha|chapati|pulao|bread|khichdi|poori|naan|staple/i.test(nameLower) || /roti|rice|bread|main/i.test(catLower)) {
        categorized.staple.push(d);
      } else if (/dal|curry|paneer|chole|rajma|sambar|korma|egg|chicken|mutton|fish|gravy|tadka/i.test(nameLower) || /curry|dal|gravy/i.test(catLower)) {
        categorized.gravy.push(d);
      } else {
        categorized.side.push(d);
      }
    });

    // Helper to pick least recently cooked with slight randomness among top candidates
    const pickBest = (list, fallbackList = dishes) => {
      const pool = list.length > 0 ? list : fallbackList;
      if (pool.length === 0) return null;
      // Sort by daysAgo descending (highest days ago / never cooked first)
      const sorted = [...pool].sort((a, b) => (b.daysAgo || 0) - (a.daysAgo || 0));
      // Pick randomly from top 3
      const topCandidates = sorted.slice(0, Math.min(3, sorted.length));
      return topCandidates[Math.floor(Math.random() * topCandidates.length)];
    };

    const staple = pickBest(categorized.staple);
    const gravy = pickBest(categorized.gravy);
    // Ensure side is distinct from gravy & staple
    const availableSides = categorized.side.filter(s => s._id.toString() !== staple?._id?.toString() && s._id.toString() !== gravy?._id?.toString());
    const side = pickBest(availableSides, categorized.side);

    const comboList = [staple, gravy, side].filter(Boolean);
    const comboNames = comboList.map(item => item.name).join(' + ');

    // Generate friendly rationale
    let reason = 'A wholesome, well-balanced meal!';
    const leastCooked = comboList.reduce((prev, curr) => ((curr.daysAgo || 0) > (prev.daysAgo || 0) ? curr : prev), comboList[0]);
    if (leastCooked && leastCooked.daysAgo !== 999 && leastCooked.daysAgo > 3) {
      reason = `You haven't eaten ${leastCooked.name} in ${leastCooked.daysAgo} days!`;
    } else if (leastCooked && leastCooked.daysAgo === 999) {
      reason = `Try ${leastCooked.name} — it hasn't been cooked yet!`;
    }

    return res.json({
      success: true,
      data: {
        staple,
        gravy,
        side,
        comboList,
        comboNames,
        reason
      }
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
