module.exports = (sequelize, DataTypes) => {
  const RewardHistory = sequelize.define('RewardHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('earned', 'redeemed'),
      defaultValue: 'earned'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'reward_histories',
    timestamps: true
  });

  RewardHistory.associate = (models) => {
    RewardHistory.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    RewardHistory.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order'
    });
  };

  return RewardHistory;
};
