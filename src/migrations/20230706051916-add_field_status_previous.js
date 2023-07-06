'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Bookings', 'status_previous', {
      type: Sequelize.ENUM,
      allowNull: true,
      values: [
        'paid',
        'waiting',
        'canceled'
    ]
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Bookings', 'status_previous')
  }
};
