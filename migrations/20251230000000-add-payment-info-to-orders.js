'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'paymentUrl', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('orders', 'paymentReference', {
      type: Sequelize.STRING,
      allowNull: true
    });

     await queryInterface.addColumn('orders', 'paymentCode', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'paymentUrl');
    await queryInterface.removeColumn('orders', 'paymentReference');
    await queryInterface.removeColumn('orders', 'paymentCode');
  }
};
