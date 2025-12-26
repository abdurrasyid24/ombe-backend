'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword123 = await bcrypt.hash('admin123', salt);
    const hashedPassword = await bcrypt.hash('password123', salt);

    return queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@ombe.com',
        password: hashedPassword123,
        fullName: 'Admin Ombe',
        phone: '+6281234567890',
        address: 'Jl. Kopi No. 123, Jakarta',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'williams',
        email: 'williams@example.com',
        password: hashedPassword,
        fullName: 'Williams',
        phone: '+6281234567891',
        address: 'Jl. Contoh No. 456, Jakarta',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'roberto',
        email: 'roberto@example.com',
        password: hashedPassword,
        fullName: 'Roberto Karlos',
        phone: '+6281234567892',
        address: 'Jl. Sample No. 789, Jakarta',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'alice',
        email: 'alice@example.com',
        password: hashedPassword,
        fullName: 'Alice Johnson',
        phone: '+6281234567893',
        address: 'Jl. Coffee Street No. 111, Jakarta',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        password: hashedPassword,
        fullName: 'Bob Smith',
        phone: '+6281234567894',
        address: 'Jl. Espresso No. 222, Jakarta',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};