'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DaysActives', {
      days_active_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      day_id: {
        type: Sequelize.INTEGER,
        reference: {
          model: {
            tableName: 'Days',
            schema: 'public',
          },
          key: 'day_id'
        }
      },
      field_id: {
        type: Sequelize.INTEGER,
        reference: {
          model: {
            tableName: 'Fields',
            schema: 'public',
          },
          key: 'field_id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DaysActives');
  }
};