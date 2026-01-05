const db = require('../models');

// Get user notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const notifications = await db.Notification.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const unreadCount = await db.Notification.count({
      where: { userId, isRead: false }
    });

    res.status(200).json({
      success: true,
      data: {
        notifications: notifications.rows,
        unreadCount,
        pagination: {
          total: notifications.count,
          page: parseInt(page),
          totalPages: Math.ceil(notifications.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    next(error);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await db.Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await db.Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to create notification
exports.createNotification = async (userId, type, title, message, data = null) => {
  try {
    const notification = await db.Notification.create({
      userId,
      type,
      title,
      message,
      data
    });
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

// Get unread count only
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await db.Notification.count({
      where: { userId, isRead: false }
    });

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    next(error);
  }
};
