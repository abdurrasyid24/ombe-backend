const db = require('../models');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { category, featured, search, sort } = req.query;

    let where = { isActive: true };

    // Filter by category
    if (category) {
      const categoryData = await db.Category.findOne({ 
        where: { name: category } 
      });
      if (categoryData) {
        where.categoryId = categoryData.id;
      }
    }

    // Filter by featured
    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Search by name
    if (search) {
      where.name = {
        [db.Sequelize.Op.like]: `%${search}%`
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
      where,
      include: [{
        model: db.Category,
        as: 'category',
        attributes: ['id', 'name', 'icon']
      }],
      order
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await db.Product.findByPk(req.params.id, {
      include: [{
        model: db.Category,
        as: 'category',
        attributes: ['id', 'name', 'icon']
      }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured/list
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await db.Product.findAll({
      where: { 
        isActive: true,
        isFeatured: true 
      },
      include: [{
        model: db.Category,
        as: 'category',
        attributes: ['id', 'name', 'icon']
      }],
      order: [['rating', 'DESC']],
      limit: 6
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    // If image uploaded
    if (req.file) {
      productData.image = req.file.path;
      productData.imagePublicId = req.file.filename;
    }

    const product = await db.Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await db.Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = req.body;

    // If new image uploaded, delete old image from cloudinary
    if (req.file) {
      if (product.imagePublicId) {
        await cloudinary.uploader.destroy(product.imagePublicId);
      }
      updateData.image = req.file.path;
      updateData.imagePublicId = req.file.filename;
    }

    await product.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await db.Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete image from cloudinary
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};