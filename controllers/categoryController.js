const db = require('../models');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;

    let where = {};

    // Default hanya tampilkan category yang active
    // Kecuali admin request dengan includeInactive=true
    if (includeInactive !== 'true') {
      where.isActive = true;
    }

    const categories = await db.Category.findAll({
      where,
      include: [{
        model: db.Product,
        as: 'products',
        attributes: ['id', 'name', 'isActive'],
        where: { isActive: true },
        required: false
      }],
      order: [['name', 'ASC']]
    });

    // Format response dengan product count
    const categoriesWithCount = categories.map(cat => {
      const plainCategory = cat.toJSON();
      return {
        id: plainCategory.id,
        name: plainCategory.name,
        description: plainCategory.description,
        icon: plainCategory.icon,
        isActive: plainCategory.isActive,
        count: plainCategory.products.length,
        createdAt: plainCategory.createdAt,
        updatedAt: plainCategory.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await db.Category.findByPk(req.params.id, {
      include: [{
        model: db.Product,
        as: 'products',
        where: { isActive: true },
        required: false,
        order: [['name', 'ASC']]
      }]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category with products
// @route   GET /api/categories/:id/products
// @access  Public
exports.getCategoryProducts = async (req, res, next) => {
  try {
    const { featured, minPrice, maxPrice, sort } = req.query;

    const category = await db.Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Build where clause for products
    let productWhere = { 
      isActive: true,
      categoryId: req.params.id
    };

    // Filter by featured
    if (featured === 'true') {
      productWhere.isFeatured = true;
    }

    // Filter by price range
    if (minPrice) {
      productWhere.price = {
        ...productWhere.price,
        [db.Sequelize.Op.gte]: parseFloat(minPrice)
      };
    }
    if (maxPrice) {
      productWhere.price = {
        ...productWhere.price,
        [db.Sequelize.Op.lte]: parseFloat(maxPrice)
      };
    }

    // Sorting
    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc') {
      order = [['price', 'ASC']];
    } else if (sort === 'price_desc') {
      order = [['price', 'DESC']];
    } else if (sort === 'rating') {
      order = [['rating', 'DESC']];
    } else if (sort === 'name') {
      order = [['name', 'ASC']];
    }

    const products = await db.Product.findAll({
      where: productWhere,
      order
    });

    res.status(200).json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon
      },
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, isActive } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists
    const categoryExists = await db.Category.findOne({ where: { name } });

    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await db.Category.create({
      name,
      description,
      icon,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, isActive } = req.body;

    const category = await db.Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if name is being changed and already exists
    if (name && name !== category.name) {
      const nameExists = await db.Category.findOne({
        where: {
          name,
          id: { [db.Sequelize.Op.ne]: req.params.id }
        }
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (typeof isActive === 'boolean') category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await db.Category.findByPk(req.params.id, {
      include: [{
        model: db.Product,
        as: 'products'
      }]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    if (category.products && category.products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products. Please delete or reassign products first.',
        productsCount: category.products.length
      });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete category (set isActive to false)
// @route   PUT /api/categories/:id/deactivate
// @access  Private/Admin
exports.deactivateCategory = async (req, res, next) => {
  try {
    const category = await db.Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category deactivated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate category
// @route   PUT /api/categories/:id/activate
// @access  Private/Admin
exports.activateCategory = async (req, res, next) => {
  try {
    const category = await db.Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category.isActive = true;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category activated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category statistics
// @route   GET /api/categories/:id/stats
// @access  Private/Admin
exports.getCategoryStats = async (req, res, next) => {
  try {
    const category = await db.Category.findByPk(req.params.id, {
      include: [{
        model: db.Product,
        as: 'products',
        attributes: ['id', 'price', 'rating', 'stock', 'isActive']
      }]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const products = category.products || [];

    // Calculate statistics
    const stats = {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      inactiveProducts: products.filter(p => !p.isActive).length,
      totalStock: products.reduce((sum, p) => sum + p.stock, 0),
      averagePrice: products.length > 0 
        ? (products.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.length).toFixed(2)
        : 0,
      averageRating: products.length > 0
        ? (products.reduce((sum, p) => sum + parseFloat(p.rating), 0) / products.length).toFixed(1)
        : 0,
      lowestPrice: products.length > 0 
        ? Math.min(...products.map(p => parseFloat(p.price))).toFixed(2)
        : 0,
      highestPrice: products.length > 0
        ? Math.max(...products.map(p => parseFloat(p.price))).toFixed(2)
        : 0
    };

    res.status(200).json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        description: category.description
      },
      stats
    });
  } catch (error) {
    next(error);
  }
};