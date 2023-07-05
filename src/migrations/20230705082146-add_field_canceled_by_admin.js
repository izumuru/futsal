'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Bookings', 'canceled_by_admin', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Bookings', 'canceled_by_admin')
  }
};
