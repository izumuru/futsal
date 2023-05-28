'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('PaymentTypes', [
      {payment_type_name: 'E-Wallet',createdAt: new Date(),
        updatedAt: new Date()},
      {payment_type_name: 'Gerai',createdAt: new Date(),
        updatedAt: new Date()},
      {payment_type_name: 'Virtual Account',createdAt: new Date(),
        updatedAt: new Date()},
      {payment_type_name: 'Cash',createdAt: new Date(),
        updatedAt: new Date()},
    ]);
  },

  async down (queryInterface, Sequelize) {
  }
};
