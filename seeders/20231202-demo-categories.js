'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('categories', [
      {
        name: 'Beverages',
        description: 'Hot and cold coffee beverages',
        icon: 'local_cafe',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Foods',
        description: 'Pastries, sandwiches, and snacks',
        icon: 'restaurant',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Desserts',
        description: 'Sweet treats and cakes',
        icon: 'cake',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Merchandise',
        description: 'Coffee beans and equipment',
        icon: 'shopping_bag',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('categories', null, {});
  }
};