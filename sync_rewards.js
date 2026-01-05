require('dotenv').config();
const db = require('./models');

async function syncMissingRewards() {
  try {
    // Find all completed orders that don't have reward history yet
    const completedOrders = await db.Order.findAll({
      where: { status: 'completed' }
    });

    console.log(`Found ${completedOrders.length} completed orders`);

    const USD_TO_IDR = 16000;
    let added = 0;

    for (const order of completedOrders) {
      // Check if reward already exists for this order
      const existingReward = await db.RewardHistory.findOne({
        where: { orderId: order.id }
      });

      if (existingReward) {
        console.log(`✓ Order ${order.orderNumber} already has reward`);
        continue;
      }

      // Calculate points (1.5% of finalTotal in IDR)
      const totalInIDR = order.finalTotal * USD_TO_IDR;
      const points = Math.floor(totalInIDR * 0.015);

      if (points <= 0) {
        console.log(`✗ Order ${order.orderNumber} - points too small`);
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

        console.log(`+ Added ${points} points for order ${order.orderNumber} to user ${user.username}`);
        added++;
      }
    }

    console.log(`\nDone! Added rewards for ${added} orders.`);
    
    // Show updated user points
    console.log('\n--- Updated User Points ---');
    const users = await db.User.findAll({
      where: { rewardPoints: { [db.Sequelize.Op.gt]: 0 } },
      attributes: ['username', 'rewardPoints']
    });
    users.forEach(u => console.log(`${u.username}: ${u.rewardPoints} pts`));
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

syncMissingRewards();
