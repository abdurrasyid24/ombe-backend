const { Order, OrderItem, Product, User } = require('../models');
const { addRewardPoints } = require('./rewardController');
const { createNotification } = require('./notificationController');

// Get dashboard stats
exports.getDashboard = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const processingOrders = await Order.count({ where: { status: 'processing' } });
    const completedOrders = await Order.count({ where: { status: 'completed' } });
    const cancelledOrders = await Order.count({ where: { status: 'cancelled' } });

    // Get recent orders
    const recentOrders = await Order.findAll({
      attributes: ['id', 'orderNumber', 'totalAmount', 'discount', 'finalTotal', 'status', 'createdAt', 'updatedAt', 'userId'],
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] },
        { model: OrderItem, as: 'items' }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Calculate total revenue
    const totalRevenue = await Order.sum('finalTotal', {
      where: { status: 'completed' }
    });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: totalRevenue || 0,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all orders with filtering and sorting
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const orders = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone'] },
        { 
          model: OrderItem, 
          as: 'items',
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: orders.rows,
      pagination: {
        total: orders.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(orders.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single order detail
exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone'] },
        { 
          model: OrderItem, 
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Send notification for status update
    const statusMessages = {
      'processing': { title: 'Order is Being Prepared! ☕', message: `Your order ${order.orderNumber} is now being prepared.` },
      'completed': { title: 'Order Completed! 🎉', message: `Your order ${order.orderNumber} has been completed. Enjoy your coffee!` },
      'cancelled': { title: 'Order Cancelled ❌', message: `Your order ${order.orderNumber} has been cancelled.` }
    };

    if (statusMessages[status]) {
      await createNotification(
        order.userId,
        'order_update',
        statusMessages[status].title,
        statusMessages[status].message,
        { orderId: order.id, orderNumber: order.orderNumber, oldStatus, newStatus: status }
      );
    }

    // Add reward points when order is completed (1.5% of total)
    if (status === 'completed' && oldStatus !== 'completed') {
      await addRewardPoints(
        order.userId,
        order.id,
        order.finalTotal,
        `Points from order ${order.orderNumber}`
      );
    }

    res.status(200).json({
      success: true,
      message: `Order status updated from ${oldStatus} to ${status}`,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      attributes: ['id', 'username', 'email', 'fullName', 'phone', 'role', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: users.rows,
      pagination: {
        total: users.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(users.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const products = await Product.findAndCountAll({
      include: [{
        model: require('../models').Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      attributes: ['id', 'name', 'price', 'stock', 'image', 'categoryId', 'isFeatured', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: products.rows,
      pagination: {
        total: products.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(products.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
