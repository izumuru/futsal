'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Fields', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Fields', 'deletedAt')
  }
};
