'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Fields', {
      field_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      booking_open: {
        allowNull: false,
        type: Sequelize.TIME
      },
      booking_close: {
        allowNull: false,
        type: Sequelize.TIME
      },
      waktu_mulai_malam: {
        allowNull: true,
        type: Sequelize.TIME
      },
      harga: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      harga_malam: {
        allowNull: true,
        type: Sequelize.DOUBLE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Fields');
  }
};