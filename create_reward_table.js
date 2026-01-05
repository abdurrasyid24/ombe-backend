require('dotenv').config();
const db = require('./models');

async function createRewardTable() {
  try {
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS reward_histories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        orderId INT,
        points INT NOT NULL,
        type ENUM('earned', 'redeemed') DEFAULT 'earned',
        description VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (orderId) REFERENCES orders(id)
      )
    `);
    console.log('reward_histories table created!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

createRewardTable();
