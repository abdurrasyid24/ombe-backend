require('dotenv').config();
const db = require('./models');

async function checkRewards() {
  try {
    const count = await db.RewardHistory.count();
    console.log('Total reward history:', count);
    
    const rh = await db.RewardHistory.findAll({
      include: [{ model: db.User, as: 'user', attributes: ['username'] }]
    });
    
    rh.forEach(r => {
      console.log(`User: ${r.user?.username}, Points: ${r.points}, ${r.description}`);
    });
    
    console.log('\n--- Users with points ---');
    const users = await db.User.findAll({
      where: { rewardPoints: { [db.Sequelize.Op.gt]: 0 } },
      attributes: ['id', 'username', 'rewardPoints']
    });
    users.forEach(u => console.log(`${u.username}: ${u.rewardPoints} pts`));
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkRewards();
