const db = require('../models');
const { createNotification } = require('./notificationController');

exports.getRewards = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await db.User.findByPk(userId, {
      attributes: ['id', 'rewardPoints']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const history = await db.RewardHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50,
      include: [{
        model: db.Order,
        as: 'order',
        attributes: ['orderNumber']
      }]
    });

    res.status(200).json({
      success: true,
      data: {
        totalPoints: user.rewardPoints || 0,
        history: history.map(h => ({
          id: h.id,
          points: h.points,
          type: h.type,
          description: h.description,
          orderNumber: h.order?.orderNumber || null,
          createdAt: h.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    next(error);
  }
};

exports.addRewardPoints = async (userId, orderId, orderTotal, description) => {
  try {
    // Convert USD to IDR first (rate: 16000), then calculate 1.5%
    const USD_TO_IDR = 16000;
    const totalInIDR = orderTotal * USD_TO_IDR;
    const pointsPercentage = 0.015;
    const points = Math.floor(totalInIDR * pointsPercentage);

    if (points <= 0) return null;

    const user = await db.User.findByPk(userId);
    if (!user) return null;

    user.rewardPoints = (user.rewardPoints || 0) + points;
    await user.save();

    const rewardHistory = await db.RewardHistory.create({
      userId,
      orderId,
      points,
      type: 'earned',
      description: description || `Points from order`
    });

    // Create notification for reward earned
    await createNotification(
      userId,
      'reward',
      'Reward Points Earned! 🎁',
      `Congratulations! You earned ${points.toLocaleString()} points from your order!`,
      { points, orderId }
    );

    console.log(`Added ${points} reward points to user ${userId} for order ${orderId}`);
    return rewardHistory;
  } catch (error) {
    console.error('Add reward points error:', error);
    return null;
  }
};
