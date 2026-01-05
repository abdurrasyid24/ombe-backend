require('dotenv').config();
const db = require('./models');

async function updateExistingCompletedOrders() {
  try {
    const completedOrders = await db.Order.findAll({
      where: { status: 'completed' }
    });

    console.log(`Found ${completedOrders.length} completed orders`);

    for (const order of completedOrders) {
      // Check if reward already exists for this order
      const existingReward = await db.RewardHistory.findOne({
        where: { orderId: order.id }
      });

      if (existingReward) {
        console.log(`Order ${order.orderNumber} already has reward`);
        continue;
      }

      // Calculate points (1.5% of finalTotal)
      const points = Math.floor(order.finalTotal * 0.015 * 16000); // Convert to IDR first

      if (points <= 0) {
        console.log(`Order ${order.orderNumber} - points too small`);
        continue;
      }

      // Update user points
      const user = await db.User.findByPk(order.userId);
      if (user) {
        user.rewardPoints = (user.rewardPoints || 0) + points;
        await user.save();

        // Create reward history
        await db.RewardHistory.create({
          userId: order.userId,
          orderId: order.id,
          points: points,
          type: 'earned',
          description: `Points from order ${order.orderNumber}`
        });

        console.log(`Added ${points} points to user ${user.username} for order ${order.orderNumber}`);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

updateExistingCompletedOrders();
