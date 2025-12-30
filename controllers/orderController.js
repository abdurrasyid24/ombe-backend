const db = require('../models');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `OMB-${timestamp}-${random}`;
};

// @desc    Get all orders (user's own orders or all for admin)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    let where = {};

    // If not admin, only get user's own orders
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    }

    const orders = await db.Order.findAll({
      where,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'fullName']
        },
        {
          model: db.OrderItem,
          as: 'items',
          include: [{
            model: db.Product,
            as: 'product',
            attributes: ['id', 'name', 'image', 'price']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await db.Order.findByPk(req.params.id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'fullName', 'phone', 'address']
        },
        {
          model: db.OrderItem,
          as: 'items',
          include: [{
            model: db.Product,
            as: 'product',
            attributes: ['id', 'name', 'image', 'price', 'description']
          }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user is order owner or admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  const t = await db.sequelize.transaction();

  try {
    const { items, paymentMethod, deliveryAddress, notes, discount, couponCode, finalTotal } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await db.Product.findByPk(item.productId);

      if (!product) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `Product with id ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        size: item.size || 'medium'
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }

    // Create order
    // Convert deliveryAddress to string if it's an object
    let addressString = deliveryAddress;
    if (typeof deliveryAddress === 'object' && deliveryAddress !== null) {
      addressString = JSON.stringify(deliveryAddress);
    } else if (!deliveryAddress) {
      addressString = req.user.address;
    }

    const order = await db.Order.create({
      orderNumber: generateOrderNumber(),
      userId: req.user.id,
      totalAmount,
      discount: discount || 0,
      finalTotal: finalTotal || totalAmount,
      couponCode: couponCode || null,
      paymentMethod: paymentMethod || 'cash',
      deliveryAddress: addressString,
      notes,
      status: 'pending'
    }, { transaction: t });

    // Create order items
    for (const item of orderItems) {
      await db.OrderItem.create({
        orderId: order.id,
        ...item
      }, { transaction: t });
    }

    // Generate payment if amount > 0
    let paymentData = {};
    if (finalTotal > 0) {
      try {
        const paymentService = require('../services/paymentService');
        // Need to fetch user with Phone if not available in req.user
        // Assuming req.user has what we need or we fetch it.
        // The current middleware puts user in req.user but might not have all fields if token payload is small.
        // Let's rely on req.user for now or fetch fresh if needed.

        // We need to pass valid items structure
        // The service expects array of object with product: {name}, price, quantity
        // The orderItems array we built has {productId, quantity, price, size}. We need product name.
        // So we need to map usage of 'items' from req.body with fetched 'product' data in loop

        // Re-construct detailed items list for payment service
        const paymentItems = [];
        for (let i = 0; i < items.length; i++) {
          const reqItem = items[i];
          const product = await db.Product.findByPk(reqItem.productId);
          if (product) {
            paymentItems.push({
              product: { name: product.name },
              price: product.price,
              quantity: reqItem.quantity
            });
          }
        }

        paymentData = await paymentService.createPayment({
          finalTotal: finalTotal || totalAmount,
          orderNumber: order.orderNumber
        }, req.user, paymentItems, paymentMethod);

        // Update order with payment info
        order.paymentUrl = paymentData.paymentUrl;
        order.paymentReference = paymentData.reference;
        order.paymentCode = paymentData.paymentCode;
        await order.save({ transaction: t });

      } catch (paymentErr) {
        console.error("Payment creation failed", paymentErr);
        // We can either fail the order or allow it but without payment link (user has to retry)
        // For now, let's fail the order to avoid confusion
        await t.rollback();
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment: ' + paymentErr.message
        });
      }
    }

    await t.commit();

    // Fetch complete order with relations
    const completeOrder = await db.Order.findByPk(order.id, {
      include: [
        {
          model: db.OrderItem,
          as: 'items',
          include: [{
            model: db.Product,
            as: 'product',
            attributes: ['id', 'name', 'image', 'price']
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: completeOrder
    });
  } catch (error) {
    if (t.finished !== 'commit') { // Check if not already committed
      await t.rollback();
    }
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const order = await db.Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  const t = await db.sequelize.transaction();

  try {
    const order = await db.Order.findByPk(req.params.id, {
      include: [{
        model: db.OrderItem,
        as: 'items'
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user is order owner or admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending orders'
      });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await db.Product.findByPk(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save({ transaction: t });
      }
    }

    order.status = 'cancelled';
    await order.save({ transaction: t });

    await t.commit();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await db.Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.destroy();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};